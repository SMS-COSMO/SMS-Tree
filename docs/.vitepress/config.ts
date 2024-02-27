import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/SMS-Tree',
  lang: 'zh-cn',
  lastUpdated: true,
  title: 'SMS-Tree',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SMS-COSMO/SMS-Tree' },
    ],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/SMS-COSMO/SMS-Tree/edit/main/docs/:path',
    },
  },
});
