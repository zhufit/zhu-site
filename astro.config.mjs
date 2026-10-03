import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import accessibleContent from './src/utils/accessible-content.mjs';

export default defineConfig({
  output: 'static',
  integrations: [mdx()],
  markdown: {
    processor: satteri({ hastPlugins: [accessibleContent] }),
    shikiConfig: { theme: 'github-dark-high-contrast' },
  },
});
