/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit membaca file font bawaan dari node_modules, jadi jangan di-bundle
  serverExternalPackages: ['pdfkit'],
  // Indikator dev Next.js di pojok bawah disembunyikan supaya tidak menutupi tampilan saat demo
  devIndicators: false,
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
