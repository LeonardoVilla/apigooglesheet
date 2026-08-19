import React, { useState } from 'react';
import { Copy, Check, Sparkles, Terminal, Code2 } from 'lucide-react';
import { APPS_SCRIPT_BOILERPLATE } from '../data/sheetsMethods';

export const AppsScriptGenerator: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedFetchGet, setCopiedFetchGet] = useState(false);
  const [copiedFetchPost, setCopiedFetchPost] = useState(false);
  const [apiUrl, setApiUrl] = useState('https://script.google.com/macros/s/SEU_ID_DO_SCRIPT/exec');
  const [columns, setColumns] = useState('id, nome, email, telefone, status');

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCustomizedScript = () => {
    return APPS_SCRIPT_BOILERPLATE;
  };

  const getFetchGetSnippet = () => {
    return `// 1. Como LER dados da sua planilha (GET)
async function lerPlanilha() {
  const url = '${apiUrl}';
  
  try {
    const response = await fetch(url);
    const resultado = await response.json();
    
    if (resultado.success) {
      console.log('Dados recebidos:', resultado.data);
      return resultado.data;
    } else {
      console.error('Erro na planilha:', resultado.error);
    }
  } catch (err) {
    console.error('Erro de conexão:', err);
  }
}`;
  };

  const getFetchPostSnippet = () => {
    const sampleObj = columns
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)
      .reduce((acc, col, idx) => {
        acc[col] = idx === 0 ? '1' : col === 'email' ? 'contato@exemplo.com' : 'Exemplo';
        return acc;
      }, {} as Record<string, string>);

    const bodyString = JSON.stringify(sampleObj, null, 2);

    return `// 2. Como INSERIR uma nova linha na planilha (POST)
async function adicionarLinha() {
  const url = '${apiUrl}';
  
  const novosDados = ${bodyString};

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Evita preflight CORS no Apps Script
      },
      body: JSON.stringify(novosDados)
    });
    
    const resultado = await response.json();
    console.log('Resposta do servidor:', resultado);
  } catch (err) {
    console.error('Erro ao enviar:', err);
  }
}`;
  };

  return (
    <div id="apps-script-generator-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-100">
              Gerador de Código: Google Apps Script API
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gere o script pronto para colar em <strong className="text-zinc-300">Extensões &gt; Apps Script</strong> da sua planilha e o código de consumo no front-end.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Colunas da sua planilha (separadas por vírgula):
          </label>
          <input
            id="input-columns"
            type="text"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="id, nome, email, telefone"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            A primeira linha da sua planilha deve conter exatamente esses nomes como cabeçalhos.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            URL da Web App (gerada após Implantação):
          </label>
          <input
            id="input-api-url"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="https://script.google.com/macros/s/.../exec"
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Substitua pela URL real fornecida pelo Google após clicar em <em>Implantar &gt; Nova implantação</em>.
          </p>
        </div>
      </div>

      {/* Code for Apps Script */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
              1. Código para o Google Apps Script (Cole na Planilha)
            </h4>
          </div>
          <button
            id="btn-copy-script"
            onClick={() => copyToClipboard(getCustomizedScript(), setCopiedScript)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg transition-colors"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedScript ? 'Copiado!' : 'Copiar Script'}
          </button>
        </div>
        <div className="bg-[#050505] text-emerald-300/90 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-72 border border-zinc-800/80">
          <pre className="text-zinc-300">{getCustomizedScript()}</pre>
        </div>
      </div>

      {/* Code for Frontend Consumption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              2. Como Chamar no JavaScript (GET / Leitura)
            </span>
            <button
              id="btn-copy-fetch-get"
              onClick={() => copyToClipboard(getFetchGetSnippet(), setCopiedFetchGet)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded transition-colors"
            >
              {copiedFetchGet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedFetchGet ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="bg-[#050505] text-zinc-300 rounded-xl p-3 font-mono text-xs overflow-x-auto max-h-56 border border-zinc-800/80">
            <pre>{getFetchGetSnippet()}</pre>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              3. Como Chamar no JavaScript (POST / Escrita)
            </span>
            <button
              id="btn-copy-fetch-post"
              onClick={() => copyToClipboard(getFetchPostSnippet(), setCopiedFetchPost)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded transition-colors"
            >
              {copiedFetchPost ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedFetchPost ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="bg-[#050505] text-zinc-300 rounded-xl p-3 font-mono text-xs overflow-x-auto max-h-56 border border-zinc-800/80">
            <pre>{getFetchPostSnippet()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
