export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) {
    const userStore = useUserStore();
    if (to.path === '/')
      return;

    if (!userStore.loggedIn)
      navigateTo('/user/login');
  }
});
