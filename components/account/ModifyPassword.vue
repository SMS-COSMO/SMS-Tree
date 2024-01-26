<template>
  <el-card>
    <el-form class="mx-auto max-w-500px" label-position="top">
      <el-form-item>
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          原密码
        </div>
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          新密码
        </div>
        <el-input
          v-model="form.newPassword" type="password" show-password
          @keyup.enter="form.oldPassword && form.newPassword ? modify() : () => { }"
        />
      </el-form-item>
      <el-form-item class="m-0">
        <el-button color="#146E3C" :loading="buttonLoading" @click="modify">
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user';

const { $api } = useNuxtApp();

const form = reactive({
  oldPassword: '',
  newPassword: '',
});

const buttonLoading = ref(false);
async function modify() {
  buttonLoading.value = true;
  if (form.oldPassword === form.newPassword) {
    ElMessage({
      message: '新密码不能与旧密码相同',
      type: 'error',
      showClose: true,
    });
    buttonLoading.value = false;
    return;
  }

  const userStore = useUserStore();
  try {
    const message = await $api.user.modifyPassword.mutate({ oldPassword: form.oldPassword, newPassword: form.newPassword });
    ElMessage({
      message,
      type: 'success',
      showClose: true,
    });
    userStore.passwordChange();
  } catch (err) {
    useErrorHandler(err);
  }
  buttonLoading.value = false;
}
</script>
