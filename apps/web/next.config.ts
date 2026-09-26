/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sandworm/editor", "@sandworm/types"],
  // Next spawns a worker per CPU for static generation; on memory-constrained
  // build hosts that fans out enough to get SIGKILL'd by the OOM killer
  // ("Next.js build worker exited with code: null and signal: SIGKILL").
  // Capping it to one worker trades build speed for staying under memory.
  experimental: {
    cpus: 1,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
