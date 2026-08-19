import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '../../../../lib/googleAuth';
import { signSession, SESSION_COOKIE_NAME } from '../../../../lib/session';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const baseUrl = process.env.APP_BASE_URL ?? request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?authError=1`);
  }

  let spreadsheetId = '';
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      spreadsheetId = typeof decoded.spreadsheetId === 'string' ? decoded.spreadsheetId : '';
    } catch {
      // state inválido/adulterado — segue sem retomar a análise automaticamente
    }
  }

  let tokens;
  try {
    const client = getOAuth2Client();
    const result = await client.getToken(code);
    tokens = result.tokens;
  } catch {
    return NextResponse.redirect(`${baseUrl}/?authError=1`);
  }

  if (!tokens.access_token) {
    return NextResponse.redirect(`${baseUrl}/?authError=1`);
  }

  const sessionValue = signSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? undefined,
    expiry_date: tokens.expiry_date ?? undefined,
  });

  const redirectUrl = new URL('/', baseUrl);
  redirectUrl.searchParams.set('connected', '1');
  if (spreadsheetId) {
    redirectUrl.searchParams.set('spreadsheetId', spreadsheetId);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias — access_token é renovado via refresh_token
  });

  return response;
}
