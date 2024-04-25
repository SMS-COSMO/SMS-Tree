import type { NotificationOptions } from 'element-plus';

export function useMessage(
  opt: Partial<NotificationOptions>,
) {
  onNuxtReady(() =>
    ElNotification({
      offset: useDevice().isMobileOrTablet ? 0 : 60,
      ...opt,
    }),
  );
}
