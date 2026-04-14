import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
