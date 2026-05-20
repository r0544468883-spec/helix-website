import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://helix.co.il',
  vite: {
    plugins: [tailwindcss()],
  },
});
