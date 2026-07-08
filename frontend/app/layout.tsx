import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrowEasy · CSV Lead Importer',
  description: 'Upload any lead CSV and map it straight into GrowEasy CRM.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
