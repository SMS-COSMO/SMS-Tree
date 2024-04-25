import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref('');
  const username = ref('');
  const role = ref<TUserRole>('student');
  const classId = ref<string>('');
  const activeGroupIds = ref<string[]>([]);
  const isDefaultPassword = ref(true);

  const login = (data: TUserLogin) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    userId.value = data.id;
    username.value = data.username;
    role.value = data.role;
    classId.value = data.classId ?? '';
    activeGroupIds.value = data.activeGroupIds;
  };

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = '';
    username.value = '';

    role.value = 'student';
    classId.value = '';
    activeGroupIds.value = [];
  };

  const passwordChange = () => {
    isDefaultPassword.value = false;
  };

  const setGroupId = (newId: string[]) => {
    activeGroupIds.value = newId;
  };

  return {
    loggedIn,
    accessToken,
    refreshToken,
    userId,
    username,
    role,
    classId,
    activeGroupIds,
    isDefaultPassword,
    login,
    logout,
    passwordChange,
    setGroupId,
  };
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({
      // One month
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
