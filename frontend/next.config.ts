import type { NextConfig } from "next";

const API_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://tios.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/email/:path*",
        destination: `${API_BACKEND_URL}/api/email/:path*`,
      },
      {
        source: "/api/jobs/:path*",
        destination: `${API_BACKEND_URL}/api/jobs/:path*`,
      },
      {
        source: "/api/jobs",
        destination: `${API_BACKEND_URL}/api/jobs`,
      },
      {
        source: "/api/leads/:path*",
        destination: `${API_BACKEND_URL}/api/leads/:path*`,
      },
      {
        source: "/api/leads",
        destination: `${API_BACKEND_URL}/api/leads`,
      },
      {
        source: "/api/meetings/:path*",
        destination: `${API_BACKEND_URL}/api/meetings/:path*`,
      },
      {
        source: "/api/meetings",
        destination: `${API_BACKEND_URL}/api/meetings`,
      },
      {
        source: "/api/apollo/:path*",
        destination: `${API_BACKEND_URL}/api/apollo/:path*`,
      },
      {
        source: "/api/hunter/:path*",
        destination: `${API_BACKEND_URL}/api/hunter/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${API_BACKEND_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;

