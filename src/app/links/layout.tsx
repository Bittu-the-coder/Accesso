import { PAGE_SEO, SITE_CONFIG, getBreadcrumbSchema } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: PAGE_SEO.links.title,
  description: PAGE_SEO.links.description,
  keywords: PAGE_SEO.links.keywords,
  alternates: {
    canonical: `${SITE_CONFIG.url}/links`,
  },
  openGraph: {
    title: PAGE_SEO.links.title,
    description: PAGE_SEO.links.description,
    url: '/links',
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: SITE_CONFIG.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_SEO.links.title,
    description: PAGE_SEO.links.description,
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'URL Shortener', url: '/links' },
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
