import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '../../../../lib/googleAuth';
import { verifySession, SESSION_COOKIE_NAME } from '../../../../lib/session';

type AnalyzeResult = { success: true; headers: string[]; source: 'public' | 'oauth' } | { success: false; error: string; status: number };

function extractHeadersFromRawRow(rawHeaders: string[]): string[] {
  let lastNonEmpty = -1;
  rawHeaders.forEach((h, idx) => {
    if (h.length > 0) lastNonEmpty = idx;
  });

  return rawHeaders.slice(0, lastNonEmpty + 1).map((h, idx) => (h.length > 0 ? h : `coluna_${idx + 1}`));
}

async function tryPublicGviz(spreadsheetId: string): Promise<AnalyzeResult> {
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  let response: Response;
  try {
    response = await fetch(gvizUrl);
  } catch {
    return { success: false, error: 'Não foi possível conectar ao Google Sheets.', status: 502 };
  }

  if (!response.ok) {
    return {
      success: false,
      error: 'Esta planilha não é pública ou não foi encontrada.',
      status: response.status === 404 ? 404 : 403,
    };
  }

  const text = await response.text();

  // A resposta vem envolta em "google.visualization.Query.setResponse({...});"
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!jsonMatch) {
    return { success: false, error: 'Esta planilha não é pública ou o formato de resposta é inesperado.', status: 403 };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch {
    return { success: false, error: 'Falha ao interpretar os dados da planilha.', status: 502 };
  }

  const cols = parsed?.table?.cols;
  const rows = parsed?.table?.rows;
  if (!Array.isArray(cols) || cols.length === 0) {
    return { success: false, error: 'A planilha está vazia ou não possui colunas.', status: 200 };
  }

  // O GViz só preenche col.label quando reconhece a primeira linha como cabeçalho.
  // Quando isso falha, os nomes reais das colunas vêm na primeira linha de "rows".
  const labelsFromCols = cols.map((col: any) => (col?.label ?? '').toString().trim());
  const hasColLabels = labelsFromCols.some((label: string) => label.length > 0);

  const firstRowValues: string[] = Array.isArray(rows?.[0]?.c)
    ? rows[0].c.map((cell: any) => (cell?.v ?? '').toString().trim())
    : [];

  const headers = extractHeadersFromRawRow(hasColLabels ? labelsFromCols : firstRowValues);

  if (headers.length === 0) {
    return { success: false, error: 'Não foi possível detectar os cabeçalhos da planilha.', status: 200 };
  }

  return { success: true, headers, source: 'public' };
}

async function tryOAuthSheets(spreadsheetId: string, cookieValue: string | undefined): Promise<AnalyzeResult> {
  const session = verifySession(cookieValue);
  if (!session) {
    return { success: false, error: 'requiresAuth', status: 401 };
  }

  try {
    const client = getOAuth2Client();
    client.setCredentials({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expiry_date: session.expiry_date,
    });

    const sheets = google.sheets({ version: 'v4', auth: client });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '1:1',
    });

    const firstRow = (result.data.values?.[0] ?? []).map((v) => (v ?? '').toString().trim());
    const headers = extractHeadersFromRawRow(firstRow);

    if (headers.length === 0) {
      return { success: false, error: 'Não foi possível detectar os cabeçalhos da planilha.', status: 200 };
    }

    return { success: true, headers, source: 'oauth' };
  } catch (error: any) {
    const statusCode = error?.code === 404 || error?.response?.status === 404 ? 404 : 403;
    return {
      success: false,
      error: 'Não foi possível ler esta planilha com sua conta Google. Verifique se você tem acesso a ela.',
      status: statusCode,
    };
  }
}

export async function POST(request: NextRequest) {
  const { spreadsheetId } = await request.json();

  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    return NextResponse.json({ success: false, error: 'spreadsheetId é obrigatório.' }, { status: 400 });
  }

  const publicResult = await tryPublicGviz(spreadsheetId);
  if (publicResult.success) {
    return NextResponse.json({ success: true, headers: publicResult.headers, source: publicResult.source });
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const oauthResult = await tryOAuthSheets(spreadsheetId, cookieValue);

  if (oauthResult.success) {
    return NextResponse.json({ success: true, headers: oauthResult.headers, source: oauthResult.source });
  }

  if (oauthResult.error === 'requiresAuth') {
    return NextResponse.json(
      {
        success: false,
        requiresAuth: true,
        error: 'Esta planilha não é pública. Conecte-se com o Google para acessá-la.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: false, error: oauthResult.error }, { status: oauthResult.status });
}
