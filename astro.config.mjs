// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Setting the site URL to your custom domain
  site: 'https://saritas.tr',
  // Since we're using a custom domain, base should be '/' instead of '/meditations'
  base: '/',
  trailingSlash: 'ignore',
  build: {
    format: 'directory'
  }
});