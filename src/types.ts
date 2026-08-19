export type IntegrationMethodId = 'apps-script' | 'service-account' | 'oauth' | 'public-csv';

export interface IntegrationMethod {
  id: IntegrationMethodId;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  difficulty: 'Fácil' | 'Médio' | 'Avançado';
  idealFor: string;
  cost: string;
  summary: string;
  steps: string[];
  pros: string[];
  cons: string[];
}

export type CodeLanguage = 'javascript' | 'python' | 'curl' | 'appscript';
export type ApiAction = 'read' | 'append' | 'update' | 'search';
