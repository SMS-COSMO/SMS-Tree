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
  ],
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
  build: {
    transpile: ['trpc-nuxt'],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
});
