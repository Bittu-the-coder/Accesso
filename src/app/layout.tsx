import { ThemeProvider } from '@/components/theme-provider';
import {
  PAGE_SEO,
  SITE_CONFIG,
  SITE_DESCRIPTION,
  getFAQSchema,
  getOrganizationSchema,
  getWebApplicationSchema,
} from '@/lib/seo';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: PAGE_SEO.home.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_DESCRIPTION.default,
  keywords: PAGE_SEO.home.keywords,
  authors: [{ name: SITE_CONFIG.creator, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.creator,
  category: 'technology',
  classification: 'Utilities',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: '/',
    siteName: SITE_CONFIG.name,
    title: PAGE_SEO.home.title,
    description: SITE_DESCRIPTION.default,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_SEO.home.title,
    description: SITE_DESCRIPTION.short,
    creator: SITE_CONFIG.twitter,
    site: SITE_CONFIG.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': SITE_CONFIG.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const webAppSchema = getWebApplicationSchema();
  const orgSchema = getOrganizationSchema();
  const faqSchema = getFAQSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link
          rel="preconnect"
          href="https://ik.imagekit.io"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([webAppSchema, orgSchema, faqSchema]),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
