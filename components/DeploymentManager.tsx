import React, { useState, useEffect } from 'react';
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  FileSpreadsheet,
  Code2,
  Tag,
  Pencil,
} from 'lucide-react';
import {
  Deployment,
  listDeployments,
  removeDeployment,
  renameDeployment,
  spreadsheetUrlOf,
  scriptEditorUrlOf,
} from '../lib/deployments';

export const DeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [copiedId, setCopiedId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [draftLabel, setDraftLabel] = useState('');

  // localStorage só existe no cliente: ler depois da montagem evita divergência com o HTML do servidor.
  useEffect(() => {
    setDeployments(listDeployments());
  }, []);

  const copyUrl = (deployment: Deployment) => {
    navigator.clipboard.writeText(deployment.webAppUrl);
    setCopiedId(deployment.scriptId);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleRemove = (scriptId: string) => {
    setDeployments(removeDeployment(scriptId));
  };

  const startRename = (deployment: Deployment) => {
    setEditingId(deployment.scriptId);
    setDraftLabel(deployment.label ?? '');
  };

  const commitRename = (scriptId: string) => {
    setDeployments(renameDeployment(scriptId, draftLabel.trim()));
    setEditingId('');
    setDraftLabel('');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div id="deployment-manager-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Database className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-base font-bold text-zinc-100">Minhas APIs Publicadas</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Planilhas conectadas e seus endpoints. Fica salvo neste navegador.
          </p>
        </div>
      </div>

      {deployments.length === 0 ? (
        <div id="deployment-manager-empty" className="py-10 text-center space-y-2">
          <Database className="w-8 h-8 text-zinc-700 mx-auto" />
          <p className="text-xs text-zinc-400">Nenhuma API publicada ainda.</p>
          <p className="text-[11px] text-zinc-500">
            Publique uma pela aba <strong className="text-zinc-400">Apps Script (REST)</strong> e ela aparece aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((deployment) => (
            <div
              key={deployment.scriptId}
              id={`deployment-${deployment.scriptId}`}
              className="p-4 bg-[#050505] rounded-xl border border-zinc-800/80 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingId === deployment.scriptId ? (
                    <div className="flex items-center gap-2">
                      <input
                        id={`input-rename-${deployment.scriptId}`}
                        type="text"
                        value={draftLabel}
                        autoFocus
                        onChange={(e) => setDraftLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(deployment.scriptId);
                          if (e.key === 'Escape') setEditingId('');
                        }}
                        placeholder="Nome desta planilha"
                        className="flex-1 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        id={`btn-save-rename-${deployment.scriptId}`}
                        onClick={() => commitRename(deployment.scriptId)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-zinc-950 rounded-lg transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-100 truncate">
                        {deployment.label || 'Planilha sem nome'}
                      </h4>
                      <button
                        id={`btn-rename-${deployment.scriptId}`}
                        onClick={() => startRename(deployment)}
                        title="Renomear"
                        className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500 mt-0.5">Publicada em {formatDate(deployment.createdAt)}</p>
                </div>

                <button
                  id={`btn-remove-${deployment.scriptId}`}
                  onClick={() => handleRemove(deployment.scriptId)}
                  title="Remover da lista"
                  className="text-zinc-500 hover:text-red-400 transition-colors shrink-0 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {deployment.headers.map((header, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/80 border border-zinc-800 text-emerald-400/90"
                  >
                    {header}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Endpoint</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <code className="flex-1 px-2.5 py-1.5 text-[11px] bg-zinc-900/60 border border-zinc-800 rounded-lg text-emerald-400 font-mono break-all">
                    {deployment.webAppUrl || '(sem URL)'}
                  </code>
                  {deployment.webAppUrl && (
                    <button
                      id={`btn-copy-url-${deployment.scriptId}`}
                      onClick={() => copyUrl(deployment)}
                      className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg transition-colors shrink-0"
                    >
                      {copiedId === deployment.scriptId ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedId === deployment.scriptId ? 'Copiado!' : 'Copiar'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-800/60">
                <a
                  href={spreadsheetUrlOf(deployment.spreadsheetId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors pt-2"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  Abrir planilha
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a
                  href={scriptEditorUrlOf(deployment.scriptId)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors pt-2"
                >
                  <Code2 className="w-3 h-3" />
                  Abrir editor do script
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                {deployment.webAppUrl && (
                  <a
                    href={deployment.webAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors pt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Testar endpoint
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
