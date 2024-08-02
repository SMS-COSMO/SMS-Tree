export default defineNitroConfig({
  srcDir: 'server',
  routeRules: {
    '/api': {
      cors: true,
      headers: {
        'access-control-allow-methods': '*',
      },
    },
  },
});
