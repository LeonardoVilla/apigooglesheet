# 📊 Google Sheets API Hub

> **Guia interativo que ensina 4 formas diferentes de transformar uma planilha do Google Sheets em uma fonte de dados/API — com gerador de código ao vivo, sem custo de servidor.**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets API](https://img.shields.io/badge/Google_Sheets_API_v4-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)

**🌐 Demo online:** [apigooglesheet.vercel.app](https://apigooglesheet.vercel.app/)

---

## 📌 O que é este projeto?

Muita gente pergunta "dá pra usar o Google Sheets como banco de dados/API?" — e a resposta é sim, só que existe **mais de um jeito de fazer isso**, cada um com trade-offs diferentes de facilidade, segurança e custo.

O **Google Sheets API Hub** é uma aplicação **Next.js** que funciona como um **hub didático e interativo**: em vez de só explicar em texto, ela te deixa colar a URL de uma planilha real, detectar as colunas automaticamente e **gerar o código pronto** (Apps Script, Python, Node.js ou cURL) para cada uma das 4 estratégias de integração mais usadas.

> ⚠️ Importante: rodar este projeto **não expõe automaticamente a sua planilha como API**. Ele é uma ferramenta que gera o código/script que você mesmo implanta (no Apps Script, no seu backend, etc.). Quem vira "API" é o script gerado — não este app em si.

---

## 🚀 Funcionalidades

O app é dividido em 4 abas:

| Aba | O que faz |
|---|---|
| **Comparativo** | Compara os 4 métodos de integração (dificuldade, custo, prós e contras) e mostra o passo a passo de cada um. |
| **Apps Script (REST)** | Você cola a URL de uma planilha (pública ou privada). O app detecta as colunas automaticamente e gera um script Google Apps Script pronto (`doGet`/`doPost`) para você colar e publicar como Web App. |
| **SDKs & Código** | Gerador de snippets prontos em **Python (gspread)**, **Node.js (googleapis)** e **cURL** para ler, inserir, atualizar e buscar dados via Conta de Serviço ou API oficial. |
| **Extrator de IDs** | Cola a URL da planilha e extrai o `spreadsheetId`, além de montar automaticamente as URLs públicas de exportação **CSV** e **GViz (JSON)**. |

Para planilhas **privadas**, o app implementa um fluxo real de **login com Google (OAuth 2.0)** para detectar as colunas sem que você precise compartilhar a planilha publicamente.

---

## 🏗️ Os 4 métodos de integração explicados no app

```
  [Front-end / App Mobile / Automação]
                  │
                  ▼ (HTTP GET / POST via JSON)
   [Google Apps Script Web App Endpoint]
                  │
                  ▼ (Leitura & Append de Linhas)
      [Planilha Google Sheets (Database)]
```

1. **Google Apps Script (Web App)** — recomendado para iniciantes, bots e MVPs. Cria um endpoint REST público em minutos, sem Google Cloud Console.
2. **Conta de Serviço (Service Account)** — ideal para backends (Node.js/Python) que precisam ler/gravar dados sem interação do usuário.
3. **Google OAuth 2.0 (Sheets API v4)** — para SaaS multiusuário, onde cada pessoa autoriza o acesso à própria planilha.
4. **Exportação pública CSV / GViz** — leitura instantânea, sem autenticação, para planilhas públicas.

### Exemplo do script gerado (`Code.gs`)

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

## 🛠️ Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Route Handlers) |
| UI | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Estilo | [Tailwind CSS v4](https://tailwindcss.com/) (tema dark) |
| Ícones | [Lucide React](https://lucide.dev/) |
| Animações | [Motion](https://motion.dev/) |
| Integração com dados | [`googleapis`](https://www.npmjs.com/package/googleapis) (Google Sheets API v4), Google Apps Script, GViz API |
| Autenticação | OAuth 2.0 do Google, com sessão assinada via HMAC (`node:crypto`) em cookie `httpOnly` |
| Deploy | Vercel (Serverless Functions via Route Handlers) |

Não há banco de dados nem backend externo: toda a lógica de servidor roda nas **Route Handlers** do Next.js, em `app/api/`.

---

## 📁 Estrutura do projeto

```
apigooglesheet/
├── app/
│   ├── api/
│   │   ├── auth/           # Login/callback/status/logout do OAuth do Google
│   │   └── sheets/analyze/ # Detecta os cabeçalhos de uma planilha (pública ou privada)
│   ├── layout.tsx
│   ├── page.tsx            # Página principal com as 4 abas
│   └── globals.css
├── components/              # SheetConnector, CodeGenerator, UrlHelper, MethodCard...
├── data/sheetsMethods.ts    # Conteúdo comparativo dos 4 métodos + template do Apps Script
├── lib/
│   ├── googleAuth.ts        # Cliente OAuth2 do Google
│   ├── session.ts           # Assinatura/verificação da sessão (cookie)
│   └── spreadsheetUrl.ts    # Extração do spreadsheetId a partir da URL
├── types.ts
└── .env.example
```

---

## 💻 Como rodar o projeto localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou superior e npm.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/LeonardoVilla/apigooglesheet.git
   cd apigooglesheet
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (necessário apenas se você quiser testar a detecção de colunas em planilhas **privadas** — planilhas públicas funcionam sem nenhuma credencial):
   ```bash
   cp .env.example .env.local
   ```
   Preencha `.env.local` seguindo o guia da seção abaixo.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

5. **Verifique os tipos (opcional):**
   ```bash
   npm run lint
   ```

6. **Gere o build de produção:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Configuração do Google Cloud Console (OAuth)

Só é necessário se você quiser testar a leitura de planilhas **privadas** dentro do app (planilhas públicas funcionam sem nenhuma credencial, via GViz).

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
5. Preencha `.env.local` (dev) com os valores abaixo, e cadastre as mesmas variáveis em **Vercel → Project → Settings → Environment Variables** para produção:

| Variável | Descrição |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID gerado no Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret gerado no Cloud Console |
| `GOOGLE_REDIRECT_URI` | Ex: `http://localhost:3000/api/auth/callback` |
| `SESSION_SECRET` | Chave para assinar o cookie de sessão. Gere com `openssl rand -base64 32` |
| `APP_BASE_URL` | URL base da aplicação em cada ambiente (ex: `http://localhost:3000`) |

> Nunca prefixe essas variáveis com `NEXT_PUBLIC_` — elas são usadas apenas no servidor (Route Handlers) e não devem ir para o front-end.

---

## 🌐 Deploy

- **Vercel**: importe o repositório, defina o Framework Preset como **Next.js**, e configure as variáveis de ambiente da seção acima. Deploy automático a cada push.
- **Demo em produção**: [apigooglesheet.vercel.app](https://apigooglesheet.vercel.app/)

> Não use GitHub Pages para este projeto: ele é hospedagem estática e não executa as Route Handlers do Next.js (login OAuth, detecção de planilha privada). Use Vercel ou outro host com suporte a Serverless/Node.js.

---

## 📄 Licença

Este repositório ainda não possui um arquivo de licença definido. Se pretende reutilizar o código, entre em contato com o autor.

Desenvolvido por **Leonardo Villa** 🚀
