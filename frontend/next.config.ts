import type { NextConfig } from "next";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  // Proxy /api/* requests to the backend API Gateway
  // This avoids CORS issues in the browser — the Next.js server relays the call.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_GATEWAY_URL}/api/:path*`,
      },
    ];
  },
  // Silence ESLint type errors during build (images from backend URLs etc.)
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
