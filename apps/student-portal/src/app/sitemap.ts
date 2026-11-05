import { MetadataRoute } from 'next';
import { loadReferenceTenant } from '../lib/tenant-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const { offerings } = loadReferenceTenant();
  const baseUrl = 'https://cuet.simplicion.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  for (const offering of offerings) {
    routes.push({
      url: `${baseUrl}/o/${offering.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  return routes;
}

