import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from '~/server/trpc/routers';

export function useIsTRPCClientError(cause: unknown): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export async function useErrorHandler(err: unknown): Promise<void> {
  if (useIsTRPCClientError(err)) {
    if (err.data?.zodError) {
      for (const issue of err.data.zodError)
        ElMessage({ message: issue.message, type: 'error', showClose: true });
    } else {
      ElMessage({ message: err.message, type: 'error', showClose: true });
      if (err.message === '用户未登录')
        onNuxtReady(() => navigateTo('/user/login'));
    }
  } else {
    ElMessage({ message: '未知错误', type: 'error', showClose: true });
  }
}
