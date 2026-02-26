import { PAGE_SEO, SITE_CONFIG, getBreadcrumbSchema } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: PAGE_SEO.files.title,
  description: PAGE_SEO.files.description,
  keywords: PAGE_SEO.files.keywords,
  alternates: {
    canonical: `${SITE_CONFIG.url}/files`,
  },
  openGraph: {
    title: PAGE_SEO.files.title,
    description: PAGE_SEO.files.description,
    url: '/files',
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: SITE_CONFIG.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_SEO.files.title,
    description: PAGE_SEO.files.description,
  },
};

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'File Vault', url: '/files' },
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
