/* eslint-disable node/prefer-global/process */
export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const userStore = useUserStore();
    if (to.path === '/')
      return;

    if (!userStore.loggedIn)
      navigateTo('/user/login');
  }
});
