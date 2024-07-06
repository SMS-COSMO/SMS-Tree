export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'SMS-Tree 项目开发文档',
      description: 'Beautifully designed Nuxt Content template built with shadcn-vue. Customizable. Compatible. Open Source.',
    },
    theme: {
      customizable: true,
      color: 'green',
      radius: 0.5,
    },
    header: {
      title: 'SMS-Tree 项目开发文档',
      showTitle: false,
      darkModeToggle: true,
      logo: {
        light: '/logo.svg',
        dark: '/logo-dark.svg',
      },
      nav: [],
      links: [{
        icon: 'lucide:github',
        to: 'https://github.com/ZTL-UwU/shadcn-docs-nuxt',
        target: '_blank',
      }],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: false,
    },
    footer: {
      credits: 'Copyright © 2024 COSMO',
      links: [{
        icon: 'lucide:github',
        to: 'https://github.com/ZTL-UwU/shadcn-docs-nuxt',
        target: '_blank',
      }],
    },
    toc: {
      enable: true,
      title: 'On This Page',
      links: [{
        icon: 'lucide:user',
        title: '用户文档',
        to: 'https://sms-tree-docs.netlify.app/',
        target: '_blank',
      }, {
        icon: 'lucide:github',
        title: 'GitHub 仓库',
        to: 'https://github.com/SMS-COSMO/SMS-Tree',
        target: '_blank',
      }],
    },
    search: {
      enable: true,
      inAside: false,
    },
  },
});
