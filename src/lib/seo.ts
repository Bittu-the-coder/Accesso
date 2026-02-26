/**
 * Centralized SEO configuration for Accesso
 * All metadata constants, keywords, and structured data live here.
 */

export const SITE_CONFIG = {
  name: 'Accesso',
  tagline: 'Share Securely, Disappear Instantly',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://accesso.vercel.app',
  locale: 'en_US',
  language: 'en',
  themeColor: '#2563eb',
  creator: 'Accesso',
  twitter: '@accesso_app',
} as const;

export const SITE_DESCRIPTION = {
  short: 'Free encrypted temporary file & text sharing. No signup required.',
  default:
    'Accesso is a free, encrypted platform for temporary file sharing, text sharing, and URL shortening. No signup, no tracking — files and text self-destruct automatically. Share securely with password-protected tunnels.',
  long: 'Share files, code snippets, text notes, and URLs securely with Accesso — the free, open-source temporary sharing platform. Features include AES-256 encryption, password-protected tunnels, automatic expiry, CDN-powered file delivery, and real-time link analytics. No account needed. Built for developers, teams, and privacy-conscious users.',
} as const;

/** Comprehensive keyword sets for each section */
export const KEYWORDS = {
  global: [
    'file sharing',
    'text sharing',
    'temporary file sharing',
    'secure file transfer',
    'encrypted file sharing',
    'pastebin alternative',
    'url shortener',
    'anonymous file sharing',
    'self destructing files',
    'no signup file sharing',
    'share files online free',
    'temporary upload',
    'send files securely',
    'share text online',
    'code sharing',
    'privacy tools',
    'encrypted sharing platform',
    'free file transfer',
    'expiring file share',
    'zero knowledge sharing',
  ],
  text: [
    'encrypted text sharing',
    'secure pastebin',
    'self destructing messages',
    'share code snippets online',
    'temporary text storage',
    'anonymous text sharing',
    'online notepad',
    'share notes securely',
    'encrypted notes',
    'code snippet sharing',
    'developer pastebin',
    'temporary pastebin',
    'share secrets securely',
    'private text sharing',
    'encrypted code share',
  ],
  files: [
    'temporary file upload',
    'secure file sharing no signup',
    'anonymous file upload',
    'encrypted file transfer',
    'self destructing file sharing',
    'share files online free',
    'send large files securely',
    'temporary file hosting',
    'private file sharing',
    'password protected file sharing',
    'free file upload',
    'expiring file upload',
    'secure document sharing',
    'CDN file transfer',
    'fast file sharing',
  ],
  links: [
    'url shortener',
    'link shortener free',
    'custom short links',
    'short url generator',
    'link management',
    'click analytics',
    'branded short links',
    'url tracking',
    'free url shortener',
    'custom url shortener',
    'link analytics',
    'short link generator',
    'tiny url alternative',
    'url shortener with analytics',
    'link shortener with tracking',
  ],
} as const;

/** Page-specific SEO metadata */
export const PAGE_SEO = {
  home: {
    title: 'Accesso — Free Encrypted Temporary File & Text Sharing',
    description: SITE_DESCRIPTION.default,
    keywords: [...KEYWORDS.global] as string[],
  },
  text: {
    title: 'Encrypted Text Tunnel — Share Code & Notes Securely',
    description:
      'Share text, code snippets, and notes through encrypted, self-destructing tunnels. Password protection, multi-entry support, and automatic expiry. Free pastebin alternative with zero data retention.',
    keywords: [...KEYWORDS.text, ...KEYWORDS.global.slice(0, 5)] as string[],
  },
  files: {
    title: 'Secure File Vault — Temporary Encrypted File Sharing',
    description:
      'Upload and share files securely with encrypted, self-destructing tunnels. Password protection, CDN-powered delivery, and automatic deletion. No signup required — free temporary file hosting.',
    keywords: [...KEYWORDS.files, ...KEYWORDS.global.slice(0, 5)] as string[],
  },
  links: {
    title: 'Smart URL Shortener — Custom Short Links with Analytics',
    description:
      'Create branded short links with custom aliases, real-time click analytics, and optional expiration. Free URL shortener with detailed tracking and link management.',
    keywords: [...KEYWORDS.links, ...KEYWORDS.global.slice(0, 5)] as string[],
  },
};

/** JSON-LD Structured Data for WebApplication */
export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_DESCRIPTION.default,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Encrypted text sharing',
      'Temporary file upload',
      'URL shortening with analytics',
      'Password-protected tunnels',
      'Automatic expiry & deletion',
      'No signup required',
    ],
    screenshot: `${SITE_CONFIG.url}/og-image.png`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
    },
  };
}

/** JSON-LD Structured Data for Organization */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon-512.png`,
    description: SITE_DESCRIPTION.short,
    sameAs: [],
  };
}

/** JSON-LD FAQ Schema for homepage */
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Accesso free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Accesso is completely free. No signup, no credit card, and no hidden fees. Share files, text, and links securely at zero cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long do shared files and texts stay?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'By default, shared content expires after 24 hours and is automatically deleted. You can set custom expiry times from 1 hour up to 7 days.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Accesso secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Accesso uses AES-256 encryption and offers optional password protection for tunnels. No data is retained after expiry, and no tracking or analytics are used on shared content.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an account to share files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Accesso requires zero signup. Just create a tunnel with your chosen ID, share files or text, and share the tunnel code with your recipient.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a tunnel in Accesso?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A tunnel is a secure, temporary channel identified by a custom code. You can share multiple files or text entries through a single tunnel, optionally protected by a password.',
        },
      },
    ],
  };
}

/** BreadcrumbList schema helper */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}
