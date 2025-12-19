// @ts-nocheck

import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Enable React to support React JSX components.
  integrations: [react(), tailwind()],

  output: 'server',

  server: {
    proxy: {
      '/api': {
        target: 'http://64.225.89.201:4001',
        changeOrigin: true,
      },
    },
  },

  adapter: node({
    mode: 'standalone',
  }),
});