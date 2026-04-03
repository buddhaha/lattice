import { defineConfig } from 'astro/config';

// For GitHub Pages: set site to your GitHub Pages URL
// For custom domain: set site to your domain
export default defineConfig({
  site: 'https://yourusername.github.io',
  // base: '/lattice',  // uncomment if deploying to github.io/lattice (not custom domain)
  output: 'static',
  build: {
    assets: '_assets',
  },
});
