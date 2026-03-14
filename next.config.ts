import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
