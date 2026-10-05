/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Wagmi's Base Account connector pulls in Coinbase's CDP SDK, which needs optional
// x402 packages we do not install. We do not use that connector, so it gets a stub.
const baseAccountStub = "./src/web3/stubs/base-account.ts";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: { "@base-org/account": baseAccountStub },
  },
  webpack: (config: { resolve: { alias: Record<string, string> } }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolve } = require("path");
    config.resolve.alias["@base-org/account"] = resolve(__dirname, baseAccountStub);
    return config;
  },
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
