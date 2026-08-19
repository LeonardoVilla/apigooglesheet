import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Google Sheets API Hub',
  description: 'Guia arquitetural & gerador de endpoints para transformar planilhas Google Sheets em APIs REST.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
