import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.convex.cloud; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.convex.cloud https://images.unsplash.com https://api.dicebear.com; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud; font-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
