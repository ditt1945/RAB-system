/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit membaca file font bawaan dari node_modules, jadi jangan di-bundle
  serverExternalPackages: ['pdfkit'],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
