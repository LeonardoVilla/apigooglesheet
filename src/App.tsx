import React, { useState } from 'react';
import { INTEGRATION_METHODS } from './data/sheetsMethods';
import { IntegrationMethodId } from './types';
import { MethodCard } from './components/MethodCard';
import { AppsScriptGenerator } from './components/AppsScriptGenerator';
import { CodeGenerator } from './components/CodeGenerator';
import { UrlHelper } from './components/UrlHelper';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Code,
  Layers,
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [selectedMethodId, setSelectedMethodId] = useState<IntegrationMethodId>('apps-script');
  const [activeTab, setActiveTab] = useState<'methods' | 'apps-script' | 'sdk-code' | 'url-tools'>('methods');

  const selectedMethod = INTEGRATION_METHODS.find((m) => m.id === selectedMethodId) || INTEGRATION_METHODS[0];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header id="main-header" className="bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 shadow-sm shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight">
                  Google Sheets API Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Elegant Dark
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Guia arquitetural & gerador de endpoints para transformar planilhas em APIs
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="flex items-center gap-1.5 bg-[#050505] p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              id="tab-btn-methods"
              onClick={() => setActiveTab('methods')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'methods'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Comparativo
            </button>
            <button
              id="tab-btn-apps-script"
              onClick={() => setActiveTab('apps-script')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'apps-script'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apps Script (REST)
            </button>
            <button
              id="tab-btn-sdk-code"
              onClick={() => setActiveTab('sdk-code')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'sdk-code'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              SDKs & Código
            </button>
            <button
              id="tab-btn-url-tools"
              onClick={() => setActiveTab('url-tools')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'url-tools'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Extrator de IDs
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Quick Answer Banner */}
        <section id="quick-answer-banner" className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  Resposta Rápida
                </span>
                <span className="text-xs text-zinc-400">
                  Totalmente viável para leitura, escrita e automação
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                Sim, você pode gerar e consumir APIs do Google Sheets
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Você pode criar uma <strong>API REST gratuita em 2 minutos via Google Apps Script</strong> (sem precisar de conta Google Cloud), usar uma <strong>Conta de Serviço para robôs/backends</strong>, ou consumir via <strong>Google Sheets API v4 oficial</strong>.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                id="btn-quick-apps-script"
                onClick={() => {
                  setSelectedMethodId('apps-script');
                  setActiveTab('apps-script');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-zinc-950" />
                Criar Web App REST
              </button>
              <button
                id="btn-quick-sdk"
                onClick={() => setActiveTab('sdk-code')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Code className="w-4 h-4 text-emerald-400" />
                Ver Código Backend
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-[#050505] p-3 rounded-xl border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Tempo de Setup</p>
                <p className="text-xs font-semibold text-zinc-200">~2 minutos (Apps Script)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#050505] p-3 rounded-xl border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Segurança</p>
                <p className="text-xs font-semibold text-zinc-200">Chaves JSON & OAuth 2.0</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#050505] p-3 rounded-xl border border-zinc-800/60">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Custo de API</p>
                <p className="text-xs font-semibold text-emerald-400">100% Gratuito (Cota Diária)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Methods Comparison */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Escolha a melhor estratégia para o seu caso:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {INTEGRATION_METHODS.map((method) => (
                  <MethodCard
                    key={method.id}
                    method={method}
                    isSelected={selectedMethodId === method.id}
                    onSelect={(id) => setSelectedMethodId(id)}
                  />
                ))}
              </div>
            </div>

            {/* Detailed view of selected method */}
            <section id="selected-method-details" className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedMethod.badgeColor}`}>
                      {selectedMethod.badge}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-100">{selectedMethod.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{selectedMethod.summary}</p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  Passo a Passo de Implementação:
                </h4>
                <ol className="space-y-2.5">
                  {selectedMethod.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300 bg-[#050505] p-3.5 rounded-xl border border-zinc-800/80">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-zinc-700/60">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Vantagens
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {selectedMethod.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Pontos de Atenção
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {selectedMethod.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Link to Tools */}
              {selectedMethodId === 'apps-script' && (
                <div className="pt-2">
                  <button
                    id="btn-go-to-apps-script-tool"
                    onClick={() => setActiveTab('apps-script')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Abrir Gerador de Script para esta Planilha
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedMethodId === 'service-account' && (
                <div className="pt-2">
                  <button
                    id="btn-go-to-sdk-tool"
                    onClick={() => setActiveTab('sdk-code')}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Code className="w-4 h-4 text-emerald-400" />
                    Ver Exemplos em Python (gspread) e Node.js
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 2: Apps Script Generator */}
        {activeTab === 'apps-script' && <AppsScriptGenerator />}

        {/* Tab 3: Official SDK / Service Account Code */}
        {activeTab === 'sdk-code' && <CodeGenerator />}

        {/* Tab 4: URL and ID Helper */}
        {activeTab === 'url-tools' && <UrlHelper />}
      </main>

      {/* Footer */}
      <footer className="bg-[#09090b] border-t border-zinc-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div>
            Guia de Arquitetura e APIs para Google Sheets
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Google Apps Script</span>
            <span>•</span>
            <span className="text-zinc-400">Sheets API v4</span>
            <span>•</span>
            <span className="text-zinc-400">gspread</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
