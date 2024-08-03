export function useMessage(
  opt: {
    message: string;
    type: 'error' | 'success';
  },
) {
  onNuxtReady(() => {
    if (opt.type === 'error')
      push.error({ message: opt.message });
    else if (opt.type === 'success')
      push.success({ message: opt.message });
  });
}
