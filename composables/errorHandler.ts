import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '~/server/trpc/routers';

export function useIsTRPCClientError(cause: unknown): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export async function useErrorHandler(err: any): Promise<void> {
  if (useIsTRPCClientError(err)) {
    if (err.data?.zodError) {
      for (const issue of err.data.zodError)
        useMessage({ message: issue.message, type: 'error' });
    } else {
      useMessage({ message: err.message, type: 'error' });
      if (err.message === '用户未登录') {
        useUserStore().logout();
        onNuxtReady(() => navigateTo('/user/login'));
      } else if (err.message === '登录已过期') {
        onNuxtReady(() => {
          useUserStore().logout();
          useSeiueStore().logout();
          navigateTo('/user/login');
        });
      }
    }
  } else {
    if (err.statusCode === 429)
      useMessage({ message: '接口调用过于频繁', type: 'error' });
    else
      useMessage({ message: '未知错误', type: 'error' });
  }
}
