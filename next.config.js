/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-libsql', '@libsql/client', 'pdf-parse'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'aistudio.google.com',
      },
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse uses canvas — tell webpack to ignore it
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
    }
    return config;
  },
};

module.exports = nextConfig;
