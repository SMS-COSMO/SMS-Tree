export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore();
  if (to.path === '/user/login')
    return;

  if (!userStore.loggedIn)
    return navigateTo('/user/login');
});
