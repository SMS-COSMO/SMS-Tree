export function useLogout() {
  useUserStore().logout();
  useSeiueStore().logout();
  navigateTo('/');
  useMessage({ message: '登出成功！', type: 'success' });
}
