import type { NextConfig } from "next";

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  // Allow dev server HMR WebSocket access from LAN IP (Next.js 16 Turbopack)
  // Values are matched against the hostname extracted from the browser's Origin header.
  // "localhost" and "**.localhost" are already included by default in Next.js.
  allowedDevOrigins: [
    "10.50.69.6",
    "127.0.0.1",
    "*.loca.lt",
    "*.trycloudflare.com",
  ],

  // Proxy /api/v1/* requests to the backend API Gateway
  async rewrites() {
    return [
      {
        source: "/api/v1/auth/qr/status",
        destination: "/api/v1/auth/qr/status",
      },
      {
        source: "/api/v1/:path*",
        destination: `${API_GATEWAY_URL}/api/v1/:path*`,
      },
    ];
  },

  // Allow image loading across all local & remote hosts
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
