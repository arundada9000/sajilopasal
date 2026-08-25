import type { Metadata, Viewport } from 'next';
import { Mukta, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const mukta = Mukta({
  subsets: ['devanagari', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-mukta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SajiloPasal | सजिलो पसल - Mobile POS & Udharo Ledger',
  description: 'Fast, offline-first mobile POS, digital khata, and WhatsApp billing for Nepali Kirana and retail merchants.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#007AFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ne" className={`${inter.variable} ${mukta.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-sans min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
