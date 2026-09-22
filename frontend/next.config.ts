import type { NextConfig } from "next";

const AIOS_BACKEND_URL = process.env.NEXT_PUBLIC_AIOS_API_URL || "https://aios-kkkl.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/email/:path*",
        destination: `${AIOS_BACKEND_URL}/api/email/:path*`,
      },
      {
        source: "/api/jobs/:path*",
        destination: `${AIOS_BACKEND_URL}/api/jobs/:path*`,
      },
    ];
  },
};

export default nextConfig;
