import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client';
import superjson from 'superjson';
import type { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '~/server/trpc/routers';

export const errorHandler: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          if (err.data?.zodError) {
            for (const issue of err.data.zodError)
              useElMessage({ message: issue.message, type: 'error' });
          } else {
            useElMessage({ message: err.message, type: 'error' });
            if (err.data?.code === 'UNAUTHORIZED' && err.message === '用户未登录')
              navigateTo('/user/login');
          }
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

export default defineNuxtPlugin(() => {
  /**
   * createTRPCNuxtClient adds a `useQuery` composable
   * built on top of `useAsyncData`.
   */
  const api = createTRPCNuxtClient<AppRouter>({
    links: [
      errorHandler,
      httpBatchLink({
        url: '/api/trpc',
        maxURLLength: 4000,
        headers() {
          const userStore = useUserStore();
          return {
            Authorization: userStore.accessToken,
          };
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
