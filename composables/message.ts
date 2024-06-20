import type { NotificationOptions } from 'element-plus';

export function useMessage(
  opt: Partial<NotificationOptions>,
) {
  onNuxtReady(() =>
    ElNotification({
      offset: useScreen().isSmaller('md') ? 0 : 60,
      ...opt,
    }),
  );
}
