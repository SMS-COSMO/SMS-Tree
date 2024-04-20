export function useLogout() {
  useUserStore().logout();
  navigateTo('/');
  useMessage({ message: '登出成功！', type: 'success' });
}
