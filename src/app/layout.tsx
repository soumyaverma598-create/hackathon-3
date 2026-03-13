import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PARIVESH 3.0 | Environmental Clearance Portal',
  description:
    'Official Environmental Clearance Portal, Ministry of Environment, Forest and Climate Change, Government of India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
