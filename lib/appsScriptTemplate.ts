export function generateAppsScriptCode(headers: string[], opts?: { spreadsheetId?: string }): string {
  const columnsList = headers.join(', ');
  const hasIdColumn = headers.some((h) => h.trim().toLowerCase() === 'id');

  return `/**
 * Google Apps Script - API REST gerada automaticamente
 * Planilha: ${opts?.spreadsheetId ?? '(ID não informado)'}
 * Colunas detectadas: ${columnsList}
 * Cole este código em: Extensões > Apps Script
 */

// Função executada em requisições GET (Leitura)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();

    if (rows.length === 0) {
      return jsonResponse({ success: true, data: [] });
    }

    // A primeira linha contém os cabeçalhos das colunas
    const headers = rows[0];
    const data = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const item = {};

      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      // Adiciona o número da linha para referência
      item._rowNumber = i + 1;
      data.push(item);
    }

    // Suporte a filtro por parâmetro (ex: ?id=123)
    if (e && e.parameter && e.parameter.id) {
      const filtered = data.filter(d => String(d.id || d.ID) === String(e.parameter.id));
      return jsonResponse({ success: true, total: filtered.length, data: filtered });
    }

    return jsonResponse({ success: true, total: data.length, data: data });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Função executada em requisições POST (Inserção / Gravação)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let body;

    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      body = e.parameter;
    }
    ${hasIdColumn
      ? `
    // Esta planilha possui uma coluna "id" — recomenda-se preenchê-la ao inserir novos registros
    if (!body.id) {
      return jsonResponse({ success: false, error: 'Campo "id" não informado (recomendado para esta planilha).' });
    }
`
      : ''}
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = [];

    // Mapeia os dados recebidos para a ordem correta das colunas
    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      newRow.push(body[headerName] !== undefined ? body[headerName] : '');
    }

    sheet.appendRow(newRow);

    return jsonResponse({
      success: true,
      message: 'Dados inseridos com sucesso!',
      insertedData: body,
      rowNumber: sheet.getLastRow()
    });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Função auxiliar para retornar JSON formatado com cabeçalhos CORS
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}

export function generateAppsScriptManifest(access: 'ANYONE' | 'ANYONE_ANONYMOUS' | 'DOMAIN' = 'ANYONE_ANONYMOUS'): string {
  return JSON.stringify(
    {
      timeZone: 'America/Sao_Paulo',
      exceptionLogging: 'STACKDRIVER',
      runtimeVersion: 'V8',
      webapp: {
        access,
        executeAs: 'USER_DEPLOYING',
      },
    },
    null,
    2
  );
}
