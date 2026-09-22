import type { NextConfig } from "next";

const API_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tios.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/email/:path*",
        destination: `${API_BACKEND_URL}/email/:path*`,
      },
      {
        source: "/api/jobs/:path*",
        destination: `${API_BACKEND_URL}/jobs/:path*`,
      },
      {
        source: "/api/meetings/:path*",
        destination: `${API_BACKEND_URL}/meetings/:path*`,
      },
      {
        source: "/api/apollo/:path*",
        destination: `${API_BACKEND_URL}/apollo/:path*`,
      },
    ];
  },
};

export default nextConfig;

