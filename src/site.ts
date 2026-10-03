// Site-wide facts used in the header, footer, metadata and structured data.
// Page content lives in src/content/ as Markdown.

export const SITE = {
  name: 'JJ Geewax',
  role: 'Director, Applied AI',
  org: 'Google DeepMind',
  title: 'Director, Applied AI · Google DeepMind',
  description:
    'JJ Geewax is Director, Applied AI at Google DeepMind and the author of API Design Patterns and Google Cloud Platform in Action.',
  location: 'Singapore',
  email: 'jj@geewax.org',
  url: 'https://www.geewax.org',
  links: {
    linkedin: 'https://www.linkedin.com/in/jgeewax/',
    github: 'https://github.com/jgeewax',
    x: 'https://x.com/jgeewax',
  },
  nav: [
    { href: '/writing/', label: 'Writing' },
    { href: '/speaking/', label: 'Speaking' },
    { href: '/resume/', label: 'Résumé' },
    { href: '/about/', label: 'About' },
  ],
} as const;
