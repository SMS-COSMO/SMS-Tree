import process from 'node:process';

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@unocss/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxtjs/device',
    '@nuxt/test-utils/module',
    'notivue/nuxt',
  ],
  css: [
    'notivue/notification.css',
    'notivue/animations.css',
    'notivue/notification-progress.css',
  ],
  // May be removed in nuxt 3.13.2
  vue: {
    propsDestructure: true,
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: ['types', 'constants'],
    presets: [
      {
        from: '@tanstack/vue-query',
        imports: ['useMutation', 'useQuery', 'useQueryClient', 'skipToken'],
      },
    ],
  },
  runtimeConfig: {
    public: {
      CHATGPT_DETECTOR_API: process.env.CHATGPT_DETECTOR_API,
    },
  },
  build: {
    transpile: ['trpc-nuxt'],
  },
  notivue: {
    position: 'top-center',
    pauseOnHover: true,
    avoidDuplicates: true,
    limit: 6,
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      // daily
      '0 0 * * *': ['cleanFiles'],
    },
  },
  compatibilityDate: '2024-08-28',
});
