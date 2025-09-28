import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Enable production source maps
  productionBrowserSourceMaps: true,
  
  // Configure images
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
  
  // Enable SWC minification
  swcMinify: true,
  
  // Output configuration
  output: 'standalone',
  
  // Disable ETag generation
  generateEtags: false,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
