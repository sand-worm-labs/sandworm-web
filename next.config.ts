/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only apply these changes on the client-side build
    if (!isServer) {
      // Make Monaco's workers work with the Next.js build system
      config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";

      // This is important for Monaco to work with webpack 5
      config.module.rules.push({
        test: /\.ttf$/,
        type: "asset/resource",
      });

      // Mark monaco-editor and its dependencies as external to prevent SSR issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
