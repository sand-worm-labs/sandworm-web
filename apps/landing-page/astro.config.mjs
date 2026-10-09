// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/agents': '/mcp',
  },
  server: {
    allowedHosts: ['sandwormlab.xyz', 'www.sandwormlab.xyz', 'preview-c8829726.sandwormlab.xyz'],
  },
  vite: {
    plugins: [tailwindcss()],
    preview: {
      allowedHosts: true,
    },
  }
});