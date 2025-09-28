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

  // Output configuration
  output: 'standalone',
  
  // Disable ETag generation
  generateEtags: false,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Configure base path if needed
  // basePath: '',
  
  // Configure redirects
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },
  
  // Configure rewrites
  async rewrites() {
    return [
      // Add any rewrites here if needed
    ];
  },
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here if needed
    return config;
  },
};

export default nextConfig;
