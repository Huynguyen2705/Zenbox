/**
 * @type {import('next').NextConfig}
 */


const nextConfig = {
  trailingSlash: true,
  env: {
    BUILD_STATIC_EXPORT: 'false',
    MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/product',
      },
    ]
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}',
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  output: 'standalone',

};

export default nextConfig;
