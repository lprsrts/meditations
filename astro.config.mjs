// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  // Setting the site URL to your custom domain
  site: 'https://www.saritas.tr',
  // Since we're using a custom domain, base should be '/' instead of '/meditations'
  base: '/',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets', // Using a simpler directory name without underscore
    assetsPrefix: '/' // Ensure assets are loaded from root
  },
  vite: {
    build: {
      assetsInlineLimit: 0 // Prevent Vite from inlining assets
    }
  }
});