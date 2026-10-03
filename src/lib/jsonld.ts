import { SITE } from '../site';

// schema.org Person, so search engines connect this site, the books and the profiles.
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url: SITE.url,
    jobTitle: SITE.role,
    worksFor: { '@type': 'Organization', name: SITE.org, url: 'https://deepmind.google' },
    address: { '@type': 'PostalAddress', addressLocality: 'Singapore', addressCountry: 'SG' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Pennsylvania' },
    sameAs: Object.values(SITE.links),
    knowsAbout: ['Applied AI', 'API design', 'Real-time payments', 'Cloud computing'],
  };
}

export function articleJsonLd(p: { title: string; description: string; date: Date; url: string; image?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.description,
    datePublished: p.date.toISOString(),
    url: p.url,
    image: p.image ? new URL(p.image, SITE.url).toString() : undefined,
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
  };
}
