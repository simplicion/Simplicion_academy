import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/study/', '/checkout/', '/api/'],
      },
    ],
    sitemap: 'https://cuet.simplicion.com/sitemap.xml',
  };
}

