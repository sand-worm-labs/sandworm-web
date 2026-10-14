/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Wagmi's Base Account connector pulls in Coinbase's CDP SDK, which needs optional
// x402 packages we do not install. We do not use that connector, so it gets a stub.
const baseAccountStub = "./src/web3/stubs/base-account.ts";

// A second line of defence behind the sandboxes that notebook code runs in
// (src/lib/pyodide/sandbox.ts and the JavaScript cell's frame): what the app's
// own pages may load and where a form may post.
//
// Report-only for now. The browser logs what this policy would have blocked to
// its console and blocks nothing. Enforcing it needs two things first: a pass
// over those reports, and the notebook frames served as documents of their own
// rather than srcdoc, because a srcdoc frame inherits this policy and notebook
// code has to be free to import and fetch from anywhere.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://esm.sh",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src * data: blob:",
  "media-src * data: blob:",
  "connect-src *",
  "worker-src 'self' blob: data:",
  "frame-src 'self' blob: data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  // A file is what its Content-Type says, never what its bytes look like.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites learn which site a link came from, not which notebook.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Notebook output frames have an opaque origin (sandboxed without allow-same-origin), so a font
        // they load needs a CORS header or the browser refuses it. Fonts never change under a name.
        source: "/fonts/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: { "@base-org/account": baseAccountStub },
  },
  webpack: (config: { resolve: { alias: Record<string, string> } }) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { resolve } = require("path");
    config.resolve.alias["@base-org/account"] = resolve(
      __dirname,
      baseAccountStub
    );
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
