import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '../../../../lib/googleAuth';
import { verifySession, SESSION_COOKIE_NAME } from '../../../../lib/session';
import { generateAppsScriptCode, generateAppsScriptManifest } from '../../../../lib/appsScriptTemplate';

function errorMessageOf(error: any): string {
  return JSON.stringify(error?.response?.data ?? error?.message ?? '').toLowerCase();
}

// Só um 401 (ou o erro explícito de escopo insuficiente) significa "peça consentimento de novo".
// Um 403 genérico NÃO entra aqui: a Apps Script API devolve 403 para vários motivos que um novo
// login não resolve (sem permissão de editar a planilha, API não habilitada), e tratá-lo como
// falta de escopo faz o usuário entrar em loop de consentimento.
function isMissingScopeError(error: any): boolean {
  const status = error?.code ?? error?.response?.status;
  const message = errorMessageOf(error);
  return (
    status === 401 ||
    message.includes('insufficient authentication scopes') ||
    message.includes('insufficient_scope') ||
    message.includes('invalid_grant')
  );
}

// A Apps Script API exige que o próprio usuário ative "Google Apps Script API" nas configurações
// da conta dele (script.google.com/home/usersettings). Vem desativada por padrão, e sem isso o
// Google recusa a criação do projeto com 403 mesmo que todos os escopos estejam concedidos.
function isUserSettingDisabled(error: any): boolean {
  const message = errorMessageOf(error);
  return message.includes('user has not enabled') || message.includes('apps script api');
}

// A primeira publicação de um projeto Apps Script recém-criado pode exigir que o usuário
// autorize o script uma única vez no editor — exigência do Google, não do nosso fluxo.
function needsManualAuthorization(error: any): boolean {
  const message = errorMessageOf(error);
  return message.includes('authoriz') || message.includes('user has not authorized');
}

export async function POST(request: NextRequest) {
  const { spreadsheetId, headers } = await request.json();

  if (!spreadsheetId || typeof spreadsheetId !== 'string') {
    return NextResponse.json({ success: false, error: 'spreadsheetId é obrigatório.' }, { status: 400 });
  }

  if (!Array.isArray(headers) || headers.length === 0) {
    return NextResponse.json({ success: false, error: 'headers é obrigatório.' }, { status: 400 });
  }

  const session = verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { success: false, requiresAuth: true, error: 'Conecte-se com o Google para publicar a API.' },
      { status: 401 }
    );
  }

  let scriptId: string | undefined;

  try {
    const client = getOAuth2Client();
    client.setCredentials({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expiry_date: session.expiry_date,
    });

    const script = google.script({ version: 'v1', auth: client });

    const project = await script.projects.create({
      requestBody: {
        title: 'API REST (gerada pelo Sheets API Hub)',
        parentId: spreadsheetId,
      },
    });

    scriptId = project.data.scriptId ?? undefined;
    if (!scriptId) {
      return NextResponse.json({ success: false, error: 'O Google não retornou o ID do script criado.' }, { status: 502 });
    }

    await script.projects.updateContent({
      scriptId,
      requestBody: {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: generateAppsScriptCode(headers, { spreadsheetId }),
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: generateAppsScriptManifest('ANYONE_ANONYMOUS'),
          },
        ],
      },
    });

    const version = await script.projects.versions.create({
      scriptId,
      requestBody: { description: 'Publicação automática via Sheets API Hub' },
    });

    const deployment = await script.projects.deployments.create({
      scriptId,
      requestBody: {
        versionNumber: version.data.versionNumber,
        manifestFileName: 'appsscript',
        description: 'API REST publicada pelo Sheets API Hub',
      },
    });

    const webAppUrl = deployment.data.entryPoints?.find((entry) => entry.webApp)?.webApp?.url;

    return NextResponse.json({
      success: true,
      webAppUrl,
      scriptId,
      deploymentId: deployment.data.deploymentId,
    });
  } catch (error: any) {
    if (isMissingScopeError(error)) {
      return NextResponse.json(
        {
          success: false,
          requiresPublishAuth: true,
          error: 'Autorize a publicação de scripts na sua conta Google para continuar.',
        },
        { status: 403 }
      );
    }

    if (isUserSettingDisabled(error)) {
      return NextResponse.json(
        {
          success: false,
          userSettingUrl: 'https://script.google.com/home/usersettings',
          error:
            'Ative a "API Google Apps Script" nas configurações da sua conta Google e tente novamente. ' +
            'Ela vem desativada por padrão e é obrigatória para publicar scripts pela API.',
        },
        { status: 403 }
      );
    }

    if (scriptId && needsManualAuthorization(error)) {
      return NextResponse.json(
        {
          success: false,
          needsManualAuthorization: true,
          scriptId,
          editorUrl: `https://script.google.com/d/${scriptId}/edit`,
          error: 'O Google exige que você autorize este script uma única vez no editor antes de publicá-lo.',
        },
        { status: 409 }
      );
    }

    const status = error?.code ?? error?.response?.status;
    const detail = error?.response?.data?.error?.message ?? error?.message ?? 'Erro desconhecido.';

    if (status === 403) {
      return NextResponse.json(
        {
          success: false,
          error:
            `O Google recusou a publicação (403): ${detail} — verifique se você tem permissão de editar esta planilha ` +
            'e se a configuração "API do Google Apps Script" está ativada em script.google.com/home/usersettings.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Falha ao publicar a API: ${detail}` },
      { status: 502 }
    );
  }
}
