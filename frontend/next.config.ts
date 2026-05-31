import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ?? (process.env.NODE_ENV === 'production'
      ? 'https://print-backend-chi.vercel.app/api'
      : 'http://localhost:4000/api');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Konva's Node.js build requires the native 'canvas' package which we don't need.
    // Mark it as external so webpack skips it (only the browser build is used).
    config.externals = [...(config.externals ?? []), { canvas: 'canvas' }];
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Inline env vars so they are available in client bundles at runtime
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
  async rewrites() {
    // Always proxy /api/* through Next.js so cookies are set on the frontend domain.
    // Cross-origin cookies (SameSite=None) are unreliable across browsers/extensions;
    // the proxy makes every request same-origin → no cross-origin cookie issues.
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: '',
  project: '',
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: true,
});
