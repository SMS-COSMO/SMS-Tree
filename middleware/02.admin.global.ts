export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if (to.path.startsWith('/admin')
    && (!userStore.loggedIn || !['teacher', 'admin'].includes(userStore.role))) {
    return abortNavigation();
  }
});
