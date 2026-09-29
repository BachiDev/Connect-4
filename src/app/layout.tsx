import type { Metadata, Viewport } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/chrome/SiteHeader';
import SiteFooter from '@/components/chrome/SiteFooter';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://bachi.dev/Connect-4';
const TITLE = 'Connect-4 · Fabian Bachmayer';
const DESCRIPTION =
  'Play Connect-4 locally with a friend or against a minimax AI. Full undo/redo and keyboard play.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s · Connect-4',
  },
  description: DESCRIPTION,
  authors: [{ name: 'Fabian Bachmayer', url: 'https://bachi.dev' }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Connect-4',
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: '/og-cover.png',
        width: 1200,
        height: 630,
        alt: 'Connect-4 — two-player local or vs minimax AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-cover.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Game',
  name: 'Connect-4',
  author: {
    '@type': 'Person',
    name: 'Fabian Bachmayer',
    url: 'https://bachi.dev',
  },
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: 'Game',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
