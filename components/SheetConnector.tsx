import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Link2,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Tag,
  LogIn,
  LogOut,
  ShieldCheck,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import { extractSpreadsheetId } from '../lib/spreadsheetUrl';
import { generateAppsScriptCode } from '../lib/appsScriptTemplate';
import { saveDeployment } from '../lib/deployments';

type ConnectorState = 'idle' | 'analyzing' | 'analyzed' | 'needs-auth' | 'publishing' | 'published' | 'error';

export const SheetConnector: React.FC = () => {
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
  );
  const [state, setState] = useState<ConnectorState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [connected, setConnected] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState('');
  const [scriptId, setScriptId] = useState('');
  const [manualAuthUrl, setManualAuthUrl] = useState('');

  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  const pendingPublishRef = useRef(false);
  const consentAttemptedRef = useRef(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status');
      const result = await response.json();
      setConnected(Boolean(result.connected));
    } catch {
      setConnected(false);
    }
  }, []);

  const handleAnalyze = useCallback(async (idOverride?: string) => {
    const targetId = idOverride ?? spreadsheetId;
    if (!targetId) {
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
        body: JSON.stringify({ spreadsheetId: targetId }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.requiresAuth) {
          setState('needs-auth');
          setErrorMessage(result.error || 'Esta planilha não é pública. Conecte-se com o Google para acessá-la.');
          return;
        }
        setState('error');
        setErrorMessage(result.error || 'Não foi possível analisar esta planilha.');
        return;
      }

      setHeaders(result.headers);
      setState('analyzed');
      return result.headers as string[];
    } catch {
      setState('error');
      setErrorMessage('Erro de conexão ao analisar a planilha. Tente novamente.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetId]);

  const handlePublish = useCallback(
    async (overrides?: { spreadsheetId?: string; headers?: string[] }) => {
      const targetId = overrides?.spreadsheetId ?? spreadsheetId;
      const targetHeaders = overrides?.headers ?? headers;

      if (!targetId || targetHeaders.length === 0) return;

      setState('publishing');
      setErrorMessage('');
      setManualAuthUrl('');

      try {
        const response = await fetch('/api/sheets/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreadsheetId: targetId, headers: targetHeaders }),
        });
        const result = await response.json();

        if (result.requiresPublishAuth || result.requiresAuth) {
          // Só redireciona para o consentimento uma vez por carregamento da página. Se voltarmos
          // do Google e a publicação ainda pedir autorização, o problema não é o consentimento —
          // redirecionar de novo criaria um loop infinito.
          if (consentAttemptedRef.current) {
            setState('error');
            setErrorMessage(
              'A autorização foi concedida, mas o Google ainda recusou a publicação. ' +
                'Verifique se você tem permissão de editar esta planilha e se a "API do Google Apps Script" ' +
                'está ativada em script.google.com/home/usersettings.'
            );
            return;
          }
          consentAttemptedRef.current = true;
          window.location.href = `/api/auth/login?spreadsheetId=${encodeURIComponent(targetId)}&intent=publish`;
          return;
        }

        if (result.needsManualAuthorization) {
          setState('error');
          setManualAuthUrl(result.editorUrl ?? '');
          setErrorMessage(result.error || 'Autorize o script uma única vez no editor do Apps Script.');
          return;
        }

        if (!response.ok || !result.success) {
          setState('error');
          setManualAuthUrl(result.userSettingUrl ?? '');
          setErrorMessage(result.error || 'Não foi possível publicar a API.');
          return;
        }

        setWebAppUrl(result.webAppUrl ?? '');
        setScriptId(result.scriptId ?? '');
        setState('published');
        saveDeployment({
          spreadsheetId: targetId,
          headers: targetHeaders,
          webAppUrl: result.webAppUrl ?? '',
          scriptId: result.scriptId ?? '',
          createdAt: new Date().toISOString(),
        });
      } catch {
        setState('error');
        setErrorMessage('Erro de conexão ao publicar a API. Tente novamente.');
      }
    },
    [spreadsheetId, headers]
  );

  useEffect(() => {
    checkAuthStatus();

    const params = new URLSearchParams(window.location.search);
    const connectedParam = params.get('connected');
    const spreadsheetIdParam = params.get('spreadsheetId');
    const intentParam = params.get('intent');
    const authError = params.get('authError');

    if (connectedParam === '1' || authError === '1') {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (connectedParam === '1' && spreadsheetIdParam) {
      setSheetUrl(`https://docs.google.com/spreadsheets/d/${spreadsheetIdParam}/edit`);
      pendingPublishRef.current = intentParam === 'publish';
      // Voltamos de um consentimento de publicação: não pedir consentimento outra vez.
      consentAttemptedRef.current = intentParam === 'publish';

      handleAnalyze(spreadsheetIdParam).then((detectedHeaders) => {
        if (pendingPublishRef.current && detectedHeaders && detectedHeaders.length > 0) {
          pendingPublishRef.current = false;
          handlePublish({ spreadsheetId: spreadsheetIdParam, headers: detectedHeaders });
        }
      });
    } else if (authError === '1') {
      setState('error');
      setErrorMessage('Não foi possível concluir o login com o Google. Tente novamente.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = () => {
    const url = spreadsheetId
      ? `/api/auth/login?spreadsheetId=${encodeURIComponent(spreadsheetId)}`
      : '/api/auth/login';
    window.location.href = url;
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setConnected(false);
  };

  const generatedScript = headers.length > 0 ? generateAppsScriptCode(headers, { spreadsheetId: spreadsheetId ?? undefined }) : '';

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWebAppUrl = () => {
    navigator.clipboard.writeText(webAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div id="sheet-connector-section" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-6">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-zinc-100">Conectar Planilha e Gerar API</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Cole a URL da planilha para detectar os campos e publicar a API direto nela.
            </p>
          </div>
        </div>

        {connected ? (
          <button
            id="btn-google-logout"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0"
          >
            <ShieldCheck className="w-3 h-3" />
            Conectado
            <LogOut className="w-3 h-3" />
          </button>
        ) : null}
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
            onClick={() => handleAnalyze()}
            disabled={state === 'analyzing'}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {state === 'analyzing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {state === 'analyzing' ? 'Analisando...' : 'Analisar Planilha'}
          </button>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          Planilhas públicas são lidas direto. Planilhas privadas pedem login com o Google.
        </p>
      </div>

      {state === 'needs-auth' && (
        <div id="sheet-connector-needs-auth" className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-zinc-300">{errorMessage}</p>
            <button
              id="btn-connect-google"
              onClick={handleConnect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Conectar com Google
            </button>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div id="sheet-connector-error" className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-zinc-300">{errorMessage}</p>
            {manualAuthUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  id="link-manual-authorize"
                  href={manualAuthUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir e autorizar no Google
                </a>
                <button
                  id="btn-retry-publish"
                  onClick={() => handlePublish()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {state === 'published' && (
        <div id="sheet-connector-published" className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">API publicada com sucesso</h4>
          </div>
          <p className="text-xs text-zinc-300">
            O script foi criado e implantado na sua planilha. Este é o endpoint da sua API:
          </p>

          <div className="flex items-start gap-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-300">
                <strong className="text-amber-400">Falta um passo (limitação do Google):</strong> implantações criadas
                pela API não ficam acessíveis publicamente até que a primeira publicação seja confirmada no editor.
                Abra o editor, clique em <strong className="text-zinc-200">Implantar &gt; Nova implantação &gt; App da Web</strong>,
                escolha <strong className="text-zinc-200">&quot;Qualquer pessoa&quot;</strong> e autorize. A URL abaixo passa a responder.
              </p>
              {scriptId && (
                <a
                  id="link-open-script-editor"
                  href={`https://script.google.com/d/${scriptId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Abrir editor do Apps Script
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 px-3 py-2 text-xs bg-[#050505] border border-zinc-800 rounded-lg text-emerald-400 font-mono break-all">
              {webAppUrl || '(URL não retornada pelo Google)'}
            </code>
            {webAppUrl && (
              <button
                id="btn-copy-webapp-url"
                onClick={copyWebAppUrl}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-lg transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? 'Copiado!' : 'Copiar URL'}
              </button>
            )}
          </div>
        </div>
      )}

      {headers.length > 0 && state !== 'analyzing' && (
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

          {state !== 'published' && (
            <button
              id="btn-publish-api"
              onClick={() => handlePublish()}
              disabled={state === 'publishing'}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {state === 'publishing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {state === 'publishing' ? 'Publicando na planilha...' : 'Gerar e Publicar API automaticamente'}
            </button>
          )}

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
              Prefere fazer manualmente? Cole este código em <strong className="text-zinc-400">Extensões &gt; Apps Script</strong> da sua planilha e implante como Aplicativo da Web.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
