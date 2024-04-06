export function useLogout() {
  useUserStore().logout();
  navigateTo('/');
  useElMessage({ message: '登出成功！', type: 'success' });
}
