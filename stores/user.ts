import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const loggedIn = ref(false);
  const accessToken = ref('');
  const refreshToken = ref('');
  const userId = ref('');
  const username = ref('');
  const role = ref('');
  const isDefaultPassword = ref(true);

  const login = (data: {
    accessToken: string
    refreshToken: string
    userId: string
    username: string
    role: 'admin' | 'student' | 'teacher'
  }) => {
    loggedIn.value = true;

    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    userId.value = data.userId;
    username.value = data.username;

    role.value = data.role;
  };

  const logout = () => {
    loggedIn.value = false;

    accessToken.value = '';
    refreshToken.value = '';

    userId.value = '';
    username.value = '';

    role.value = '';
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
    isDefaultPassword,
    login,
    logout,
    passwordChange,
  };
}, {
  persist: true,
});
