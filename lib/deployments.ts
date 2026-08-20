export interface Deployment {
  spreadsheetId: string;
  headers: string[];
  webAppUrl: string;
  scriptId: string;
  createdAt: string;
  /** Nome dado pelo usuário para identificar a planilha na lista. */
  label?: string;
}

const STORAGE_KEY = 'sheetapi.deployments';

export function listDeployments(): Deployment[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Deployment => typeof item?.scriptId === 'string' && typeof item?.spreadsheetId === 'string');
  } catch {
    return [];
  }
}

export function saveDeployment(deployment: Deployment): Deployment[] {
  if (typeof window === 'undefined') return [];

  // Uma planilha pode ser republicada: a entrada mais recente substitui a anterior.
  const others = listDeployments().filter((d) => d.scriptId !== deployment.scriptId);
  const updated = [deployment, ...others];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage cheio ou indisponível — a publicação em si já foi concluída.
  }

  return updated;
}

export function removeDeployment(scriptId: string): Deployment[] {
  if (typeof window === 'undefined') return [];

  const updated = listDeployments().filter((d) => d.scriptId !== scriptId);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignora falha de escrita
  }

  return updated;
}

export function renameDeployment(scriptId: string, label: string): Deployment[] {
  if (typeof window === 'undefined') return [];

  const updated = listDeployments().map((d) => (d.scriptId === scriptId ? { ...d, label } : d));

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignora falha de escrita
  }

  return updated;
}

export function spreadsheetUrlOf(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

export function scriptEditorUrlOf(scriptId: string): string {
  return `https://script.google.com/d/${scriptId}/edit`;
}
