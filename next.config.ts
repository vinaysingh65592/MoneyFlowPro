import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Image domains if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
      {
        source: "/transactions/income",
        destination: "/income",
        permanent: false,
      },
      {
        source: "/transactions/expenses",
        destination: "/expenses",
        permanent: false,
      },
      {
        source: "/people/lent",
        destination: "/lent",
        permanent: false,
      },
      {
        source: "/people/borrowed",
        destination: "/borrowed",
        permanent: false,
      },
      {
        source: "/transactions/new",
        destination: "/transactions?action=new",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
