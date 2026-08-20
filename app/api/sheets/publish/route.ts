import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '../../../../lib/googleAuth';
import { verifySession, SESSION_COOKIE_NAME } from '../../../../lib/session';
import { generateAppsScriptCode, generateAppsScriptManifest } from '../../../../lib/appsScriptTemplate';

function isMissingScopeError(error: any): boolean {
  const status = error?.code ?? error?.response?.status;
  const message = JSON.stringify(error?.response?.data ?? error?.message ?? '').toLowerCase();
  return (
    status === 401 ||
    message.includes('insufficient') ||
    message.includes('scope') ||
    message.includes('permission_denied') ||
    message.includes('request had insufficient authentication')
  );
}

// A primeira publicação de um projeto Apps Script recém-criado pode exigir que o usuário
// autorize o script uma única vez no editor — exigência do Google, não do nosso fluxo.
function needsManualAuthorization(error: any): boolean {
  const message = JSON.stringify(error?.response?.data ?? error?.message ?? '').toLowerCase();
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

    const detail = error?.response?.data?.error?.message ?? error?.message ?? 'Erro desconhecido.';
    return NextResponse.json(
      { success: false, error: `Falha ao publicar a API: ${detail}` },
      { status: 502 }
    );
  }
}
