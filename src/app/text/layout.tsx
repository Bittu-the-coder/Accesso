import { PAGE_SEO, SITE_CONFIG, getBreadcrumbSchema } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: PAGE_SEO.text.title,
  description: PAGE_SEO.text.description,
  keywords: PAGE_SEO.text.keywords,
  alternates: {
    canonical: `${SITE_CONFIG.url}/text`,
  },
  openGraph: {
    title: PAGE_SEO.text.title,
    description: PAGE_SEO.text.description,
    url: '/text',
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: SITE_CONFIG.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_SEO.text.title,
    description: PAGE_SEO.text.description,
  },
};

export default function TextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Text Tunnel', url: '/text' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}
