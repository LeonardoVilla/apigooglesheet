# 📊 Google Sheets API Hub — SheetAPI

> **Transforme qualquer planilha do Google Sheets em uma API REST de alta performance, sem custos de servidor e com deploy em minutos.**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets API](https://img.shields.io/badge/Google_Sheets_API-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)

---

## 📌 Visão Geral do Projeto

Muitas empresas e projetos precisam de uma forma ágil e sem custo para armazenar, ler e atualizar dados sem a complexidade de gerenciar bancos de dados relacionais pesados. 

O **Google Sheets API Hub** é uma solução completa desenvolvida para automatizar e demonstrar como transformar planilhas do **Google Sheets em um banco de dados / API REST** pronto para produção, suportando operações de leitura (`GET`) e escrita (`POST`), além de fornecer um painel moderno com monitoramento de latência e gerador de scripts.

---

## 🚀 Principais Recursos

- **Dashboard Moderno ("Elegant Dark UI")**: Interface inspirada nas melhores plataformas de desenvolvedores (Vercel, Supabase).
- **Gerador de Google Apps Script (REST)**: Criação de endpoints públicos/privados em menos de 2 minutos, sem necessidade de configurar projetos complexos no Google Cloud.
- **Suporte a Múltiplas Arquiteturas de Integração**:
  1. **Google Apps Script (Web App)**: Recomendado para iniciantes, bots e MVPs rápidos.
  2. **Conta de Serviço (Service Account)**: Para servidores backend (Node.js / Python com `gspread` e `googleapis`).
  3. **Google OAuth 2.0 (Sheets API v4)**: Para sistemas SaaS multi-usuário com consentimento granular.
  4. **Exportação CSV & GViz**: Para leitura pública instantânea em sites estáticos.
- **Testador Interativo de Endpoints**: Simulação e verificação de requisições e payload JSON em tempo real.
- **Gestão de API Keys & Logs de Requisições**: Área para simulação de controle de acesso e monitoramento de tráfego.
- **Deploy Zero-Config**: Pronto para deploy imediato no **Vercel** e **GitHub Pages** (com GitHub Actions integrado).

---

## 🏗️ Arquitetura e Estratégia de Integração

```
  [Front-end / App Mobile / Automação]
                  │
                  ▼ (HTTP GET / POST via JSON)
   [Google Apps Script Web App Endpoint]
                  │
                  ▼ (Leitura & Append de Linhas)
      [Planilha Google Sheets (Database)]
```

### Exemplo de Script para a Planilha (`Code.gs`):

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    data.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    total: data.length,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var headers = sheet.getDataRange().getValues()[0];
  var newRow = [];

  for (var j = 0; j < headers.length; j++) {
    newRow.push(payload[headers[j]] || "");
  }

  sheet.appendRow(newRow);
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Registro inserido com sucesso!"
  })).setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Estilização**: Tailwind CSS v4 com tema Dark Mode sofisticado
- **Ícones**: Lucide React
- **Integração de Dados**: Google Sheets API v4 (`googleapis`), Google Apps Script, GViz API
- **Autenticação**: OAuth 2.0 do Google (para planilhas privadas)
- **Deploy**: Vercel (Serverless Functions via Route Handlers)

---

## 💻 Como Rodar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/LeonardoVilla/apigooglesheet.git
   cd apigooglesheet
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (necessário apenas para analisar planilhas **privadas** — planilhas públicas funcionam sem isso):
   ```bash
   cp .env.example .env.local
   ```
   Siga o guia abaixo para preencher `.env.local` com credenciais reais.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🔐 Configuração do Google Cloud Console (OAuth)

Necessário apenas se você quiser detectar campos de planilhas **privadas** (planilhas públicas funcionam sem nenhuma credencial, via GViz).

1. Crie um projeto em [console.cloud.google.com](https://console.cloud.google.com).
2. Vá em **APIs e Serviços → Biblioteca** e habilite a **Google Sheets API**.
3. Vá em **APIs e Serviços → Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo**.
   - Preencha nome do app e e-mail de suporte.
   - Em **Escopos**, adicione `https://www.googleapis.com/auth/spreadsheets.readonly`.
   - Em **Usuários de teste**, adicione o(s) e-mail(s) do Google que vão testar o login.
   > ⚠️ Enquanto o app estiver em modo **Testing**, só contas cadastradas como Test User conseguem completar o login — isso é uma limitação do Google (não é bug do projeto). Verificação do Google só é necessária se você quiser disponibilizar o login publicamente para qualquer conta.
4. Vá em **APIs e Serviços → Credenciais → Criar Credenciais → ID do cliente OAuth**, tipo **Aplicativo da Web**:
   - **Origens JavaScript autorizadas**: `http://localhost:3000` e o domínio de produção (Vercel).
   - **URIs de redirecionamento autorizados**: `http://localhost:3000/api/auth/callback` e `https://SEU-DOMINIO/api/auth/callback`.
   - Copie o **Client ID** e o **Client Secret** gerados.
5. Preencha `.env.local` (dev) com os valores de `.env.example`, e cadastre as mesmas variáveis em **Vercel → Project → Settings → Environment Variables** para produção:
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (do Cloud Console)
   - `SESSION_SECRET` (gere com `openssl rand -base64 32`)
   - `APP_BASE_URL` (URL da aplicação em cada ambiente)

---

## 🌐 Deploy

- **Vercel**: Importe o repositório, defina o Framework Preset como **Next.js**, e configure as variáveis de ambiente da seção acima. Deploy automático a cada push.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.

Desenvolvido por **Leonardo Villa** 🚀
