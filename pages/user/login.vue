<template>
  <div class="top-margin middle mx-auto">
    <el-alert
      v-if="userStore.isDefaultPassword" title="第一次登录完毕后请修改密码！" show-icon type="warning" effect="dark"
      :closable="false"
    />
    <el-card class="mt-4">
      <template #header>
        登录
      </template>
      <el-form label-position="top">
        <el-form-item>
          <div>
            <el-icon :size="15">
              <ElIconUser />
            </el-icon>
            学号
          </div>
          <el-input v-model="form.id" />
        </el-form-item>
        <el-form-item>
          <div>
            <el-icon :size="15">
              <ElIconKey />
            </el-icon>
            密码
          </div>
          <el-input
            v-model="form.password" type="password" show-password
            @keyup.enter="form.id && form.password ? login() : () => { }"
          />
        </el-form-item>
        <el-form-item class="m-0">
          <el-button class="ml-auto" color="#146E3C" :loading="isPending" @click="login">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useMutation } from '@tanstack/vue-query';
import { useUserStore } from '~/stores/user';

useHeadSafe({
  title: '登录',
});

const { $api } = useNuxtApp();
const userStore = useUserStore();

const form = reactive({
  id: '',
  password: '',
});

const { mutate: loginMutation, isPending } = useMutation({
  mutationFn: $api.user.login.mutate,
  onSuccess: (res) => {
    userStore.login(res);
    useRouter().back();
    ElMessage({
      message: '登录成功',
      type: 'success',
      showClose: true,
    });
  },
  onError: err => useErrorHandler(err),
});

async function login() {
  loginMutation({ ...form });
}
</script>

<style scoped lang="scss">
.el-alert--warning {
  z-index: 0;
  background-color: #F29A41;
}

.middle {
  max-width: 480px;
}

.top-margin {
  margin-top: 20vh;
}
</style>
