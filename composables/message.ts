import type { NotificationOptions } from 'element-plus';

export function useMessage(
  opt: Partial<NotificationOptions>,
) {
  ElNotification({
    offset: 60,
    ...opt,
  });
}
