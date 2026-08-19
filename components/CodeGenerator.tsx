import React, { useState } from 'react';
import { CodeLanguage, ApiAction } from '../types';
import { Copy, Check, Terminal } from 'lucide-react';

export const CodeGenerator: React.FC = () => {
  const [lang, setLang] = useState<CodeLanguage>('python');
  const [action, setAction] = useState<ApiAction>('read');
  const [spreadsheetId, setSpreadsheetId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [range, setRange] = useState('Página1!A1:E20');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSnippet = () => {
    if (lang === 'python') {
      if (action === 'read') {
        return `# Usando gspread com Conta de Serviço (Service Account)
import gspread

# Autenticação direta com o arquivo de credenciais da Conta de Serviço
gc = gspread.service_account(filename='credentials.json')

# Abre a planilha pelo ID
sh = gc.open_by_key('${spreadsheetId}')
worksheet = sh.sheet1

# Lê todas as linhas formatadas como dicionários (JSON)
registros = worksheet.get_all_records()
print(registros)
`;
      } else if (action === 'append') {
        return `# Inserir uma nova linha no Google Sheets com Python
import gspread

gc = gspread.service_account(filename='credentials.json')
sh = gc.open_by_key('${spreadsheetId}')
worksheet = sh.sheet1

# Insere os dados no final da planilha
nova_linha = ['ID-105', 'Maria Silva', 'maria@email.com', '(11) 99999-8888', 'Ativo']
worksheet.append_row(nova_linha)
print("Linha inserida com sucesso!")
`;
      } else if (action === 'update') {
        return `# Atualizar uma célula ou intervalo específico
import gspread

gc = gspread.service_account(filename='credentials.json')
sh = gc.open_by_key('${spreadsheetId}')
worksheet = sh.sheet1

# Atualiza a célula C2
worksheet.update_acell('C2', 'novo_email@empresa.com')
print("Célula atualizada!")
`;
      } else {
        return `# Buscar dados por valor específico
import gspread

gc = gspread.service_account(filename='credentials.json')
sh = gc.open_by_key('${spreadsheetId}')
worksheet = sh.sheet1

# Encontra a célula correspondente
cell = worksheet.find('maria@email.com')
if cell:
    print(f"Encontrado na Linha {cell.row}, Coluna {cell.col}")
    linha_completa = worksheet.row_values(cell.row)
    print("Dados da linha:", linha_completa)
`;
      }
    } else if (lang === 'javascript') {
      if (action === 'read') {
        return `// Usando googleapis no Node.js com Service Account
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function lerPlanilha() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '${spreadsheetId}',
    range: '${range}',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    console.log('Nenhum dado encontrado.');
    return;
  }
  
  console.log('Linhas recuperadas:', rows);
}

lerPlanilha();
`;
      } else if (action === 'append') {
        return `// Inserir nova linha no Node.js
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function adicionarLinha() {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: '${spreadsheetId}',
    range: '${range}',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['101', 'Carlos Santos', 'carlos@empresa.com', 'Aprovado']
      ],
    },
  });

  console.log('Linha adicionada:', response.data);
}

adicionarLinha();
`;
      } else {
        return `// Atualizar intervalo no Node.js
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function atualizarDados() {
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: '${spreadsheetId}',
    range: 'Página1!B2:C2',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['Novo Nome', 'novo.email@exemplo.com']],
    },
  });

  console.log('Células atualizadas:', response.data.updatedCells);
}

atualizarDados();
`;
      }
    } else {
      // cURL
      if (action === 'read') {
        return `# Requisição HTTP direta à API oficial do Google Sheets
curl -X GET \\
  "https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}" \\
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \\
  -H "Accept: application/json"
`;
      } else {
        return `# Inserir dados via cURL (Google Sheets API v4)
curl -X POST \\
  "https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED" \\
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "values": [
      ["102", "Ana Paula", "ana@tech.com", "Pendente"]
    ]
  }'
`;
      }
    }
  };

  return (
    <div id="code-generator-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Exemplos de Código (SDK Oficial / Conta de Serviço)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gere o código para consumir a API do Google Sheets na sua linguagem de preferência.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded-lg border border-zinc-800">
          {(['python', 'javascript', 'curl'] as CodeLanguage[]).map((l) => (
            <button
              key={l}
              id={`tab-lang-${l}`}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === l
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {l === 'python' ? 'Python (gspread)' : l === 'javascript' ? 'Node.js (googleapis)' : 'cURL (REST)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Operação:</label>
          <select
            id="select-api-action"
            value={action}
            onChange={(e) => setAction(e.target.value as ApiAction)}
            className="w-full px-3 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="read">Ler Dados (GET / Select)</option>
            <option value="append">Adicionar Linha (POST / Append)</option>
            <option value="update">Atualizar Célula (PUT / Update)</option>
            {lang === 'python' && <option value="search">Buscar / Filtrar</option>}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">ID da Planilha:</label>
          <input
            id="input-code-spreadsheet-id"
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            placeholder="Ex: 1BxiMVs0X..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Aba e Intervalo:</label>
          <input
            id="input-code-range"
            type="text"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            placeholder="Ex: Página1!A1:D10"
          />
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between bg-zinc-900 text-zinc-400 px-4 py-2 rounded-t-xl text-xs font-mono border-t border-x border-zinc-800">
          <span className="text-emerald-400">{lang === 'python' ? 'app.py' : lang === 'javascript' ? 'index.js' : 'terminal.sh'}</span>
          <button
            id="btn-copy-code-snippet"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>
        <div className="bg-[#050505] text-zinc-200 p-4 rounded-b-xl font-mono text-xs overflow-x-auto max-h-80 border border-zinc-800">
          <pre>{getSnippet()}</pre>
        </div>
      </div>
    </div>
  );
};
