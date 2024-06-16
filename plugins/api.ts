import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client';
import superjson from 'superjson';
import type { AppRouter } from '~/server/trpc/routers';

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const api = createTRPCNuxtClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        maxURLLength: 4000,
        headers() {
          return {
            Authorization: useUserStore().accessToken,
            ...useSeiueStore().seiueHeaders(),
          };
        },
        fetch: (url, options) => {
          return fetch(url, { ...options, credentials: 'omit' });
        },
      }),
    ],
    transformer: superjson,
  });

  return {
    provide: {
      api,
    },
  };
});
