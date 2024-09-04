<template>
  <div class="h-full flex">
    <el-card class="mx-auto w-xl self-center">
      <template #header>
        登录希悦账号
      </template>
      <el-tabs v-model="selected" class="mb-2">
        <el-tab-pane label="账号密码" name="password">
          <el-form label-position="top">
            <el-form-item>
              <div>
                <el-icon class="i-tabler:user" />
                工号
              </div>
              <el-input v-model="passwordForm.schoolId" />
            </el-form-item>
            <el-form-item>
              <div>
                <el-icon class="i-tabler:lock" />
                密码
              </div>
              <el-input
                v-model="passwordForm.password" type="password" show-password
                @keyup.enter="(passwordForm.schoolId && passwordForm.password) ? passwordLoginMutation({ ...passwordForm }) : () => {}"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                color="#15803d"
                :loading="isPending"
                @click="passwordLoginMutation({ ...passwordForm })"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="手机验证码" name="phone">
          <el-form label-position="top">
            <el-form-item>
              <div>
                <el-icon class="i-tabler:phone" />
                手机号
              </div>
              <div class="w-full flex gap-2">
                <el-input v-model="phoneForm.phone" />
                <el-button :loading="isActive" @click="generatePhoneCode">
                  {{ isActive ? count : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <div>
                <el-icon class="i-tabler:lock" />
                验证码
              </div>
              <el-input
                v-model="phoneForm.code"
                @keyup.enter="(phoneForm.phone && phoneForm.code) ? phoneLoginMutation({ ...phoneForm }) : () => {}"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                color="#15803d"
                :loading="phonePending"
                @click="phoneLoginMutation({ ...phoneForm })"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const { routerBack } = defineProps<{
  routerBack: boolean;
}>();

const { $api } = useNuxtApp();
const passwordForm = reactive({
  schoolId: '',
  password: '',
});
const phoneForm = reactive({
  phone: '',
  code: '',
  reminderId: '',
});
const selected = ref<'password' | 'phone'>('password');

const queryClient = useQueryClient();
const { mutate: passwordLoginMutation, isPending } = useMutation({
  mutationFn: $api.seiue.login.mutate,
  onSuccess: (res) => {
    useSeiueStore().login(res);
    if (routerBack)
      useRouterBack('/admin');
    queryClient.invalidateQueries({ queryKey: ['seiue.me'] });
    useMessage({
      message: '登录成功',
      type: 'success',
    });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: phoneLoginMutation, isPending: phonePending } = useMutation({
  mutationFn: $api.seiue.phoneLogin.mutate,
  onSuccess: (res) => {
    useSeiueStore().login(res);
    if (routerBack)
      useRouterBack('/admin');
    queryClient.invalidateQueries({ queryKey: ['seiue.me'] });
    useMessage({
      message: '登录成功',
      type: 'success',
    });
  },
  onError: err => useErrorHandler(err),
});

const { count, dec, reset } = useCounter(60);
const { isActive, pause, resume } = useTimeoutPoll(() => {
  dec();
  if (count.value === 0) {
    pause();
    reset();
  }
}, 1000);

async function generatePhoneCode() {
  resume();
  try {
    const res = await $api.seiue.generatePhoneCode.mutate({ phone: phoneForm.phone });
    if (!res.ok) {
      useMessage({
        message: '获取验证码失败',
        type: 'error',
      });
      return;
    }
    phoneForm.reminderId = res.reminder_id;
  } catch (err) {
    pause();
    reset();
    useErrorHandler(err);
  }
}
</script>
