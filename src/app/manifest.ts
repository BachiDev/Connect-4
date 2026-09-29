import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Connect-4 · Fabian Bachmayer',
    short_name: 'Connect-4',
    description: 'Play Connect-4 locally with a friend or against a minimax AI. No tracking.',
    // Relative URLs resolve under the deployment subpath (/Connect-4/ on Pages).
    start_url: '.',
    scope: '.',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
