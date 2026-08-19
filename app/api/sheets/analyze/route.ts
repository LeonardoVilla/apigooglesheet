import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { spreadsheetId } = await request.json();

  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    return NextResponse.json({ success: false, error: 'spreadsheetId é obrigatório.' }, { status: 400 });
  }

  const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  let response: Response;
  try {
    response = await fetch(gvizUrl);
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível conectar ao Google Sheets.' }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        success: false,
        error: 'Esta planilha não é pública ou não foi encontrada. Verifique se o compartilhamento está definido como "Qualquer pessoa com o link pode ver".',
      },
      { status: response.status === 404 ? 404 : 403 }
    );
  }

  const text = await response.text();

  // A resposta vem envolta em "google.visualization.Query.setResponse({...});"
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!jsonMatch) {
    return NextResponse.json(
      { success: false, error: 'Esta planilha não é pública ou o formato de resposta é inesperado.' },
      { status: 403 }
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch {
    return NextResponse.json({ success: false, error: 'Falha ao interpretar os dados da planilha.' }, { status: 502 });
  }

  const cols = parsed?.table?.cols;
  const rows = parsed?.table?.rows;
  if (!Array.isArray(cols) || cols.length === 0) {
    return NextResponse.json({ success: false, error: 'A planilha está vazia ou não possui colunas.' }, { status: 200 });
  }

  // O GViz só preenche col.label quando reconhece a primeira linha como cabeçalho.
  // Quando isso falha, os nomes reais das colunas vêm na primeira linha de "rows".
  const labelsFromCols = cols.map((col: any) => (col?.label ?? '').toString().trim());
  const hasColLabels = labelsFromCols.some((label: string) => label.length > 0);

  const firstRowValues: string[] = Array.isArray(rows?.[0]?.c)
    ? rows[0].c.map((cell: any) => (cell?.v ?? '').toString().trim())
    : [];

  const rawHeaders = hasColLabels ? labelsFromCols : firstRowValues;

  // Descarta colunas vazias à direita (planilha costuma ter colunas em branco além dos dados reais)
  let lastNonEmpty = -1;
  rawHeaders.forEach((h, idx) => {
    if (h.length > 0) lastNonEmpty = idx;
  });

  const headers: string[] = rawHeaders
    .slice(0, lastNonEmpty + 1)
    .map((h, idx) => (h.length > 0 ? h : `coluna_${idx + 1}`));

  if (headers.length === 0) {
    return NextResponse.json({ success: false, error: 'Não foi possível detectar os cabeçalhos da planilha.' }, { status: 200 });
  }

  return NextResponse.json({ success: true, headers, source: 'public' });
}
