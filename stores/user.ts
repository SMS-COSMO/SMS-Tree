import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref('');
  const username = ref('');
  const role = ref<TUserRole>('student');
  const classId = ref<string>('');
  const groupIds = ref<string[]>([]);
  const isDefaultPassword = ref(true);

  const login = (data: TUserLogin) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    userId.value = data.id;
    username.value = data.username;
    role.value = data.role;
    classId.value = data.classId ?? '';
    groupIds.value = data.groupIds;
  };

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = '';
    username.value = '';

    role.value = 'student';
    classId.value = '';
    groupIds.value = [];
  };

  const passwordChange = () => {
    isDefaultPassword.value = false;
  };

  const setGroupId = (newId: string[]) => {
    groupIds.value = newId;
  };

  return {
    loggedIn,
    accessToken,
    refreshToken,
    userId,
    username,
    role,
    classId,
    groupIds,
    isDefaultPassword,
    login,
    logout,
    passwordChange,
    setGroupId,
  };
}, {
  persist: {
    storage: persistedState.cookiesWithOptions({
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
