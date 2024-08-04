export function useLogout() {
  useUserStore().logout();
  useSeiueStore().logout();
  navigateTo('/user/login');
  useMessage({ message: '登出成功', type: 'success' });
}
