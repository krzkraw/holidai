import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const isPagesBuild = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'Ultimate Holiday Canvas'
  },
  output: {
    assetPrefix: isPagesBuild ? '/holidai/ultimate/' : './'
  },
  source: {
    entry: {
      index: './src/main.tsx'
    }
  }
});
