/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: "http://192.168.1.76:8003/:path*",
    },
  ],
  images: {
    domains: [
      "cryptologos.cc",
      "avatars.githubusercontent.com",
      "raw.githubusercontent.com",
      "lh3.googleusercontent.com",
      "cdn.jsdelivr.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/trustwallet/assets/master/blockchains/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
