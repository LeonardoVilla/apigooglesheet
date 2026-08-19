import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import { extractSpreadsheetId } from '../lib/spreadsheetUrl';

export const UrlHelper: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
  );
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCsvUrl, setCopiedCsvUrl] = useState(false);
  const [copiedGvizUrl, setCopiedGvizUrl] = useState(false);

  const spreadsheetId = extractSpreadsheetId(sheetUrl) || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
  const csvExportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  const gvizJsonUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

  const copyText = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div id="url-helper-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-5">
      <div className="border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Link2 className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-zinc-100">
            Extrator de ID & URLs Rápidas de API
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Cole a URL da sua planilha para extrair automaticamente o <strong className="text-zinc-300">Spreadsheet ID</strong> e gerar endpoints diretos.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
          Cole o Link Completo da Planilha:
        </label>
        <input
          id="input-full-sheet-url"
          type="text"
          value={sheetUrl}
          onChange={(e) => setSheetUrl(e.target.value)}
          className="w-full px-3.5 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0.../edit"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {/* Extracted ID */}
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Spreadsheet ID</span>
            <button
              id="btn-copy-id"
              onClick={() => copyText(spreadsheetId, setCopiedId)}
              className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-xs font-mono text-zinc-200 truncate" title={spreadsheetId}>
            {spreadsheetId}
          </p>
        </div>

        {/* CSV Export Endpoint */}
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Download CSV</span>
            <div className="flex items-center gap-2">
              <a
                href={csvExportUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-200"
                title="Abrir no navegador"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                id="btn-copy-csv"
                onClick={() => copyText(csvExportUrl, setCopiedCsvUrl)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                {copiedCsvUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <p className="text-xs font-mono text-emerald-400 truncate" title={csvExportUrl}>
            {csvExportUrl}
          </p>
        </div>

        {/* GViz JSON Endpoint */}
        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">GViz JSON</span>
            <div className="flex items-center gap-2">
              <a
                href={gvizJsonUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-200"
                title="Abrir no navegador"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                id="btn-copy-gviz"
                onClick={() => copyText(gvizJsonUrl, setCopiedGvizUrl)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                {copiedGvizUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <p className="text-xs font-mono text-emerald-400 truncate" title={gvizJsonUrl}>
            {gvizJsonUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
