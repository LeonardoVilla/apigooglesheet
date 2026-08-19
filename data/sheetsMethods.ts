import { IntegrationMethod } from '../types';

export const INTEGRATION_METHODS: IntegrationMethod[] = [
  {
    id: 'apps-script',
    title: 'Google Apps Script (Web App)',
    subtitle: 'Transforma sua planilha em uma API REST (JSON) em minutos',
    badge: 'Mais Recomendado p/ Iniciantes',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    difficulty: 'Fácil',
    idealFor: 'Criar endpoints GET e POST simples sem gerenciar Google Cloud Console.',
    cost: '100% Gratuito (com cotas diárias do Google Workspace)',
    summary: 'Você escreve um script simples de poucas linhas dentro da própria planilha (Extensões > Apps Script) e publica como Web App. O Google gera uma URL pública que responde com JSON.',
    steps: [
      'Abra sua planilha no Google Sheets.',
      'Clique no menu superior em Extensões > Apps Script.',
      'Cole o código do script com as funções doGet(e) e doPost(e).',
      'Clique em Implantar > Nova Implantação.',
      'Selecione o tipo "Aplicativo da Web".',
      'Em "Quem tem acesso", escolha "Qualquer pessoa" (ou conforme necessidade).',
      'Copie a URL da Web App gerada — esse é o endpoint da sua API!'
    ],
    pros: [
      'Não precisa de Google Cloud Console nem credenciais complexas',
      'Retorna JSON formatado pronto para consumir em qualquer front-end ou backend',
      'Permite criar lógica personalizada (validações, cálculos, envio de emails) antes de salvar',
      'Fácil de depurar e testar diretamente no navegador'
    ],
    cons: [
      'Tempo de resposta um pouco mais lento (~500ms - 1.5s por requisição)',
      'Possui limite diário de requisições de acordo com a cota do Google Apps Script'
    ]
  },
  {
    id: 'service-account',
    title: 'Conta de Serviço (Service Account)',
    subtitle: 'Autenticação servidor-a-servidor para backends automatizados',
    badge: 'Ideal para Backends & Bots',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    difficulty: 'Médio',
    idealFor: 'Servidores Node.js, Python, PHP ou rotinas automatizadas que precisam ler/gravar dados sem interação do usuário.',
    cost: 'Gratuito até o limite de chamadas da API',
    summary: 'Você cria um projeto no Google Cloud Console, habilita a Google Sheets API e gera uma chave de Conta de Serviço (arquivo JSON). Você compartilha a planilha com o e-mail da conta de serviço.',
    steps: [
      'Acesse o Google Cloud Console (console.cloud.google.com).',
      'Crie um projeto e habilite a "Google Sheets API".',
      'Vá em IAM e Administração > Contas de serviço e crie uma nova conta.',
      'Gere uma chave do tipo JSON e faça o download (mantenha segura no seu backend).',
      'Copie o e-mail da conta de serviço (ex: bot@meu-projeto.iam.gserviceaccount.com).',
      'Abra a planilha no Google Sheets e compartilhe com esse e-mail com permissão de Editor.',
      'Use a biblioteca oficial (ex: googleapis no Node.js ou gspread no Python) apontando para o arquivo JSON.'
    ],
    pros: [
      'Totalmente automatizado e sem expiração de sessão',
      'Suporta alto volume e operações em lote (BatchUpdate, formatação, fórmulas)',
      'Alta segurança (permissões concedidas por planilha específica)'
    ],
    cons: [
      'Requer configuração no Google Cloud Console',
      'A chave JSON nunca deve ser exposta no navegador (front-end)'
    ]
  },
  {
    id: 'oauth',
    title: 'Google OAuth 2.0 (Sheets API v4 Oficial)',
    subtitle: 'Permite que usuários finais acessem e editem suas próprias planilhas',
    badge: 'Para Aplicações Multi-usuário',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    difficulty: 'Avançado',
    idealFor: 'Aplicativos SaaS onde cada usuário faz login com sua conta Google e o app manipula as planilhas daquele usuário.',
    cost: 'Gratuito até o limite de cotas',
    summary: 'Fluxo oficial de autorização com tela de consentimento do Google. O usuário faz login, autoriza os escopos desejados (ex: spreadsheets) e o app recebe um token de acesso temporário.',
    steps: [
      'Crie credenciais do tipo OAuth 2.0 Client ID no Google Cloud Console.',
      'Configure a tela de consentimento com os escopos (ex: https://www.googleapis.com/auth/spreadsheets).',
      'No app, implemente o fluxo de login com Google (Firebase Auth ou Google Identity Services).',
      'Utilize o token Bearer retornado no cabeçalho Authorization das requisições para https://sheets.googleapis.com/v4/spreadsheets/...'
    ],
    pros: [
      'Permite que cada usuário use sua própria conta e suas próprias planilhas',
      'Controle granular de escopos de leitura ou escrita',
      'Padrão da indústria para segurança em aplicativos web'
    ],
    cons: [
      'Requer fluxo de autenticação com tela de consentimento e renovação de tokens',
      'Necessário verificar o app no Google se for disponibilizar publicamente'
    ]
  },
  {
    id: 'public-csv',
    title: 'Exportação Pública CSV / GViz API',
    subtitle: 'Leitura direta instantânea para planilhas públicas sem autenticação',
    badge: 'Apenas Leitura',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    difficulty: 'Fácil',
    idealFor: 'Sites estáticos, catálogos ou dados abertos que só precisam de leitura rápida sem segredos.',
    cost: '100% Gratuito',
    summary: 'Se a planilha for configurada como "Qualquer pessoa com o link pode ler", o Google disponibiliza URLs públicas diretas para baixar em formato CSV ou consultar via endpoint do Google Visualizations (gviz).',
    steps: [
      'Abra sua planilha e clique em Compartilhar.',
      'Altere o acesso geral para "Qualquer pessoa com o link pode ver".',
      'Copie o ID da planilha da barra de endereços (o código entre /d/ e /edit).',
      'Monte a URL de exportação: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:json'
    ],
    pros: [
      'Zero configuração de código ou credenciais',
      'Funciona direto no navegador com um simples fetch()',
      'Perfeito para protótipos e dashboards públicos'
    ],
    cons: [
      'Apenas leitura (não permite gravar dados)',
      'A planilha inteira fica pública para qualquer pessoa com o link'
    ]
  }
];

export const APPS_SCRIPT_BOILERPLATE = `/**
 * Google Apps Script - API REST Completa para Google Sheets
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
