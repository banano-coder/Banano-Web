// @ts-nocheck

import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Enable React to support React JSX components.
  integrations: [react(), tailwind()],

  output: 'server',
  adapter: vercel()
});