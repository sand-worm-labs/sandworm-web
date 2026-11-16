import type { NextConfig } from "next";

import { SetupStepId, setupStepPath } from "./src/lib/setup/routes";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/setup",
        destination: setupStepPath(SetupStepId.ORGANISATION),
        permanent: false,
      },
    ];
  },
  transpilePackages: ["@sandworm/types", "@sandworm/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
