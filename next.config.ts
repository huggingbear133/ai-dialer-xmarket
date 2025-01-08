import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React Strict Mode
  typescript: {
    // This setting allows you to bypass TypeScript errors during the build process
    // but keep in mind that this should only be used as a temporary solution
    ignoreBuildErrors: true,
  },
  eslint: {
    // If you want to bypass eslint errors during the build process
    ignoreDuringBuilds: true,
  },
  // Other potential Next.js settings you may want to include:
  // images: {
  //   domains: ['example.com'],
  // },
  // i18n: {
  //   locales: ['en'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;