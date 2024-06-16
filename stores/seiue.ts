import { defineStore } from 'pinia';

export const useSeiueStore = defineStore('seiue', () => {
  const loggedIn = ref(false);
  const accessToken = ref<string>();
  const activeReflectionId = ref<number>();
  const cookies = ref<Record<string, string>>();

  const seiueHeaders = () => {
    if (!accessToken.value || !activeReflectionId.value)
      return {};
    return {
      'x-seiue-token': accessToken.value,
      'x-seiue-reflection-id': activeReflectionId.value.toString(),
    };
  };

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

  const refreshToken = async () => {
    if (!cookies.value)
      return false;
    const { $api } = useNuxtApp();
    const res = await $api.seiue.token.mutate({
      cookies: cookies.value,
    });
    if (!res)
      return false;
    accessToken.value = res.access_token;
    return true;
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
    seiueHeaders,
    refreshToken,
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
