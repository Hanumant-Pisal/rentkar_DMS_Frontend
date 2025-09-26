import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Enable production source maps
  productionBrowserSourceMaps: true,
  
  // Configure images
  // Image optimization configuration
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // 1 minute
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // SPA fallback for client-side routing
  async rewrites() {
    return [
      // Don't rewrite API routes, _next/static, or other special paths
      {
        source: '/:path*',
        destination: '/auth/login',
        has: [
          {
            type: 'host',
            value: '(?<host>.*)',
          },
        ],
        missing: [
          { type: 'header', key: 'accept', value: 'text/html' },
          { type: 'header', key: 'accept', value: 'application/json' },
          { type: 'header', key: 'accept', value: 'application/javascript' },
          { type: 'header', key: 'accept', value: 'text/css' },
          { type: 'header', key: 'x-requested-with', value: 'XMLHttpRequest' },
        ],
      },
      // Handle API routes and static files
      {
        source: '/(_next|static|api|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\.(?:js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))',
        destination: '/$1',
      },
    ];
  },
  
  // Enable SWC minification
  swcMinify: true,
  
  // Enable static exports for SPA behavior
  output: 'standalone',
  
  // Disable ETag generation
  generateEtags: false,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
