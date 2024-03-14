<template>
  <el-card>
    <el-form
      ref="formRef"
      :rules="rules"
      :model="form"
      class="mx-auto max-w-[500px]"
      label-position="top"
    >
      <el-form-item prop="oldPassword">
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          原密码
        </div>
        <el-input v-model="form.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item prop="newPassword">
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          新密码
        </div>
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item prop="repeatPassword">
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          确认新密码
        </div>
        <el-input
          v-model="form.repeatPassword" type="password" show-password
          @keyup.enter="form.oldPassword && form.newPassword ? modify(formRef) : () => { }"
        />
      </el-form-item>
      <el-form-item class="m-0">
        <el-button color="#146E3C" :loading="isPending" @click="modify(formRef)">
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '~/stores/user';

const props = defineProps<{
  userId: string;
}>();
const { $api } = useNuxtApp();

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
    ElMessage({
      message,
      type: 'success',
      showClose: true,
    });
    const userStore = useUserStore();
    userStore.passwordChange();
  },
  onError: err => useErrorHandler(err),
});

async function modify(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  await formEl.validate(async (valid) => {
    if (valid) {
      if (form.oldPassword === form.newPassword) {
        ElMessage({
          message: '新密码不能与旧密码相同',
          type: 'error',
          showClose: true,
        });
      }
      changePassword({
        id: props.userId,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
    }
  });
}
</script>
