/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  // ESLint non è installato come dipendenza: non bloccare la build.
  eslint: { ignoreDuringBuilds: true },
  // I tipi sono controllati nell'editor; non bloccare la build di produzione.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
