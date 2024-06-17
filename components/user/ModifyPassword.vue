<template>
  <el-card>
    <el-form
      ref="formRef"
      :rules="rules"
      :model="form"
      class="mx-auto max-w-[500px]"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
    >
      <el-form-item v-if="userStore.role === 'student'" prop="oldPassword">
        <div>
          <el-icon class="i-tabler:lock" />
          原密码
        </div>
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item prop="newPassword">
        <div>
          <el-icon class="i-tabler:lock-plus" />
          新密码
        </div>
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item prop="repeatPassword">
        <div>
          <el-icon class="i-tabler:lock-check" />
          确认新密码
        </div>
        <el-input
          v-model="form.repeatPassword" type="password" show-password
          @keyup.enter="form.oldPassword && form.newPassword ? modify(formRef) : () => { }"
        />
      </el-form-item>
      <el-form-item class="m-0">
        <el-button color="#15803d" :loading="isPending" @click="modify(formRef)">
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const props = defineProps<{
  userId: string;
}>();
const { $api } = useNuxtApp();
const device = useDevice();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const form = reactive({
  oldPassword: '',
  newPassword: '',
  repeatPassword: '',
});

const rules = reactive<FormRules<typeof form>>({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { pattern: passwordRegex, message: '密码必须包含大小写字母、数字与特殊符号' },
    { min: 8, message: '密码至少 8 位', trigger: 'change' },
    { validator: (_, value: any, callback: any) => {
      if (value === form.oldPassword)
        callback(new Error('新密码不能与旧密码相同'));
      else callback();
    }, trigger: 'change' },
  ],
  repeatPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: (_, value: any, callback: any) => {
      if (value !== form.newPassword)
        callback(new Error('密码不匹配'));
      else callback();
    }, trigger: 'blur' },
  ],
});

const { mutate: changePassword, isPending } = useMutation({
  mutationFn: $api.user.modifyPassword.mutate,
  onSuccess: (message) => {
    useMessage({ message, type: 'success' });
    resetForm(formRef.value);
  },
  onError: err => useErrorHandler(err),
});

async function modify(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  await formEl.validate(async (valid) => {
    if (valid) {
      if (form.oldPassword === form.newPassword)
        useMessage({ message: '新密码不能与旧密码相同', type: 'error' });

      changePassword({
        id: props.userId,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
    }
  });
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  formEl.resetFields();
}
</script>
