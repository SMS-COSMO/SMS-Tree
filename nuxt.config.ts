// https://nuxt.com/docs/api/configuration/nuxt-config
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
    'nuxt-cron',
  ],
  cron: {
    timeZone: 'Asia/Shanghai',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  build: {
    transpile: ['trpc-nuxt'],
  },
  device: {
    refreshOnResize: true,
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
});
