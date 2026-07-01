/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@legacy/design-system', '@legacy/shared'],
};

module.exports = nextConfig;
