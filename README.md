# 📊 Google Sheets API Hub — SheetAPI

> **Transforme qualquer planilha do Google Sheets em uma API REST de alta performance, sem custos de servidor e com deploy em minutos.**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
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

- **Frontend**: React 18, TypeScript, Vite
- **Estilização**: Tailwind CSS com tema Dark Mode sofisticado
- **Ícones**: Lucide React
- **Integração de Dados**: Google Sheets API v4, Google Apps Script, GViz API
- **CI/CD & Deploy**: GitHub Actions, Vercel

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

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🌐 Deploy

- **Vercel**: Importe o repositório e clique em Deploy (Zero configuração).
- **GitHub Pages**: Vá em `Settings` > `Pages` > `Source: GitHub Actions`.

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.

Desenvolvido por **Leonardo Villa** 🚀
