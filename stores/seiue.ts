import { defineStore } from 'pinia';

export const useSeiueStore = defineStore('seiue', () => {
  const loggedIn = ref(false);
  const accessToken = ref<string>();
  const activeReflectionId = ref<number>();
  const cookies = ref<Record<string, string>>();

  const login = async (res: {
    accessToken: string;
    activeReflectionId: number;
    cookies: Record<string, string>;
  }) => {
    loggedIn.value = true;
    accessToken.value = res.accessToken;
    activeReflectionId.value = res.activeReflectionId;
    cookies.value = res.cookies;
  };

  const logout = () => {
    loggedIn.value = false;
    accessToken.value = undefined;
    activeReflectionId.value = undefined;
    cookies.value = undefined;
  };

  return {
    loggedIn,
    accessToken,
    activeReflectionId,
    cookies,
    login,
    logout,
  };
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({
      // One month
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
