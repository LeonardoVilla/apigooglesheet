import { createHmac, timingSafeEqual } from 'node:crypto';

export interface SessionPayload {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export const SESSION_COOKIE_NAME = 'sheet_session';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET não configurado.');
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function signSession(payload: SessionPayload): string {
  const encoded = base64url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expectedSignature = sign(encoded);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
  } catch {
    return null;
  }
}
