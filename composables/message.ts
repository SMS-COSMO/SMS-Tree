export function useElMessage(
  opt: {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  },
) {
  ElMessage({
    ...opt,
    showClose: true,
    grouping: true,
  });
}
