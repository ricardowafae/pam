import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.patasamorememorias.com.br" }],
        destination: "https://patasamorememorias.com.br/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "patasamorememorias.com.br",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "ozyvrubofvkrhgyrwnot.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
