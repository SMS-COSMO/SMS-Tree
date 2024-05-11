<template>
  <div class="mx-auto mt-[30vh] max-w-120">
    <el-card class="mt-4">
      <template #header>
        登录
      </template>
      <el-form :label-position="device.isMobileOrTablet ? 'top' : 'right'">
        <el-form-item>
          <div>
            <el-icon class="i-tabler:user" />
            学工号
          </div>
          <el-input v-model="form.schoolId" />
        </el-form-item>
        <el-form-item>
          <div>
            <el-icon class="i-tabler:lock" />
            密码
          </div>
          <el-input
            v-model="form.password" type="password" show-password
            @keyup.enter="form.schoolId && form.password ? login() : () => { }"
          />
        </el-form-item>
        <el-form-item class="m-0">
          <el-button class="ml-auto" color="#15803d" :loading="isPending" @click="login">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '~/stores/user';

useHeadSafe({
  title: '登录',
});

const { $api } = useNuxtApp();
const userStore = useUserStore();
const device = useDevice();

const form = reactive({
  schoolId: '',
  password: '',
});

const { mutate: loginMutation, isPending } = useMutation({
  mutationFn: $api.user.login.mutate,
  onSuccess: (res) => {
    userStore.login(res);
    useRouter().back();
    useMessage({
      message: '登录成功',
      type: 'success',
    });
  },
  onError: err => useErrorHandler(err),
});

async function login() {
  loginMutation({ ...form });
}
</script>
