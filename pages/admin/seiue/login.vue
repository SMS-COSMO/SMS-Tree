<template>
  <el-card>
    <template #header>
      登陆希悦账号
    </template>
    <el-form :label-position="device.isMobileOrTablet ? 'top' : 'right'">
      <el-form-item>
        <div>
          <el-icon class="i-tabler:user" />
          工号
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
</template>

<script setup lang="ts">
const device = useDevice();

const { $api } = useNuxtApp();
const form = reactive({
  schoolId: '',
  password: '',
});

const { mutate: loginMutation, isPending } = useMutation({
  mutationFn: $api.seiue.login.mutate,
  onSuccess: (res) => {
    useSeiueStore().login(res);
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
