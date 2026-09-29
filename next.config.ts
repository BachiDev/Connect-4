import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export for GitHub Pages (repo: BachiDev/Connect-4, branch: master).
  // `output: 'export'` + `images.unoptimized` are required because Pages serves
  // only static files (no Next image optimizer). The CI `configure-pages`
  // step still injects `basePath` for the /Connect-4 subpath — that part stays
  // magic on purpose; everything else is explicit here.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
