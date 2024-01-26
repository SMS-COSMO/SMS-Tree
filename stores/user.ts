import { defineStore } from 'pinia';
import type { TUserLogin } from '~/types';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref('');
  const username = ref('');
  const role = ref('');
  const classIds = ref<string[]>([]);
  const groupIds = ref<string[]>([]);
  const isDefaultPassword = ref(true);

  const login = (data: TUserLogin) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    userId.value = data.id;
    username.value = data.username;
    role.value = data.role;
    classIds.value = data.classIds;
    groupIds.value = data.groupIds;
  };

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = '';
    username.value = '';

    role.value = '';
    classIds.value = [];
    groupIds.value = [];
  };

  const passwordChange = () => {
    isDefaultPassword.value = false;
  };

  return {
    loggedIn,
    accessToken,
    refreshToken,
    userId,
    username,
    role,
    classIds,
    groupIds,
    isDefaultPassword,
    login,
    logout,
    passwordChange,
  };
}, {
  persist: true,
});
