import React, { useState } from 'react';
import { Link2, Sparkles, Copy, Check, AlertCircle, Loader2, Tag } from 'lucide-react';
import { extractSpreadsheetId } from '../lib/spreadsheetUrl';
import { generateAppsScriptCode } from '../lib/appsScriptTemplate';

type ConnectorState = 'idle' | 'analyzing' | 'analyzed' | 'error';

export const SheetConnector: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
  );
  const [state, setState] = useState<ConnectorState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const spreadsheetId = extractSpreadsheetId(sheetUrl);

  const handleAnalyze = async () => {
    if (!spreadsheetId) {
      setState('error');
      setErrorMessage('URL inválida. Cole o link completo da planilha do Google Sheets.');
      return;
    }

    setState('analyzing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/sheets/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setState('error');
        setErrorMessage(
          result.error ||
            'Esta planilha não é pública. Suporte a planilhas privadas via login Google chega na próxima fase.'
        );
        return;
      }

      setHeaders(result.headers);
      setState('analyzed');
    } catch {
      setState('error');
      setErrorMessage('Erro de conexão ao analisar a planilha. Tente novamente.');
    }
  };

  const generatedScript = headers.length > 0 ? generateAppsScriptCode(headers, { spreadsheetId: spreadsheetId ?? undefined }) : '';

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="sheet-connector-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-base font-bold text-zinc-100">Conectar Planilha e Gerar API</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Cole a URL da sua planilha pública para detectar os campos automaticamente e gerar o script customizado.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Link da Planilha:</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-sheet-connector-url"
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
            />
          </div>
          <button
            id="btn-analyze-sheet"
            onClick={handleAnalyze}
            disabled={state === 'analyzing'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {state === 'analyzing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {state === 'analyzing' ? 'Analisando...' : 'Analisar Planilha'}
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          A planilha precisa estar compartilhada como "Qualquer pessoa com o link pode ver".
        </p>
      </div>

      {state === 'error' && (
        <div id="sheet-connector-error" className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300">{errorMessage}</p>
        </div>
      )}

      {state === 'analyzed' && (
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Campos Detectados ({headers.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, idx) => (
                <span
                  key={idx}
                  id={`detected-field-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-900/60 border border-zinc-800 text-emerald-400"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                Script Apps Script Customizado
              </h4>
              <button
                id="btn-copy-connector-script"
                onClick={copyScript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar Script'}
              </button>
            </div>
            <div className="bg-[#050505] rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-72 border border-zinc-800/80">
              <pre className="text-zinc-300">{generatedScript}</pre>
            </div>
            <p className="text-[11px] text-zinc-500">
              Cole este código em <strong className="text-zinc-400">Extensões &gt; Apps Script</strong> da sua planilha e implante como Aplicativo da Web.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
