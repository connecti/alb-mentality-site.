/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.printful.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Aucune balise "generator" ni empreinte d'outil de génération n'est exposée.
  generateEtags: true,
};

module.exports = nextConfig;
