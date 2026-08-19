import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '../../../../lib/googleAuth';

export async function GET(request: NextRequest) {
  const spreadsheetId = request.nextUrl.searchParams.get('spreadsheetId') ?? '';

  const state = Buffer.from(JSON.stringify({ spreadsheetId, nonce: crypto.randomUUID() })).toString('base64url');

  let authUrl: string;
  try {
    authUrl = getAuthUrl(state);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }

  return NextResponse.redirect(authUrl);
}
