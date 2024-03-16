// https://github.com/nuxt-themes/docus/blob/main/nuxt.schema.ts
export default defineAppConfig({
  docus: {
    title: 'SMS-Tree 帮助文档',
    description: '为用户和开发者提供的详细指南',
    image: 'https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png',
    socials: {
      github: 'sms-cosmo/sms-tree',
    },
    github: {
      dir: '/docs',
      branch: 'main',
      repo: 'sms-tree',
      owner: 'sms-cosmo',
      edit: true,
    },
    aside: {
      level: 1,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      logo: {
        light: '/logo.svg',
        dark: '/logo-dark.svg',
      },
      fluid: true,
    },
  },
});
