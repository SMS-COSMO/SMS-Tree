<template>
  <el-card>
    <el-form ref="formRef" label-position="top" class="register-form mx-auto py-5" :model="form" :rules="rules">
      <el-form-item prop="id">
        <div class="icon-label">
          <el-icon :size="15">
            <ElIconUser />
          </el-icon>
          学号 / 用户名
        </div>
        <el-input v-model="form.id" />
      </el-form-item>
      <el-form-item prop="username">
        <div>
          <el-icon :size="15">
            <ElIconUser />
          </el-icon>
          姓名
        </div>
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item prop="password">
        <div>
          <el-icon :size="15">
            <ElIconKey />
          </el-icon>
          密码
        </div>
        <el-input v-model="form.password" type="text" />
      </el-form-item>
      <el-form-item>
        <div>
          <el-icon :size="15">
            <ElIconOperation />
          </el-icon>
          用户权限
        </div>
        <client-only>
          <el-select v-model="form.role" placeholder="请选择" style="width: 100%;">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
            <el-option label="管理员" value="admin" />
          </el-select>
          <template #fallback>
            <SelectPlaceholder />
          </template>
        </client-only>
      </el-form-item>
      <el-form-item>
        <el-button class="submit-button" color="#146E3C" :loading="isPending" @click="register(formRef)">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TUserRegister } from '~/types/index';

useHeadSafe({
  title: '创建用户',
});

const { $api } = useNuxtApp();

const formRef = ref<FormInstance>();
const form = reactive<TUserRegister>({
  id: '',
  username: '',
  password: '',
  role: 'student',
});

const rules = reactive<FormRules<TUserRegister>>({
  id: [
    { required: true, message: '学号 / 用户名不能为空', trigger: 'blur' },
    { min: 4, max: 24, message: '学号 / 用户名长度应在 4~24 之间', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
    { min: 2, max: 15, message: '姓名长度应在 2~15 之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位', trigger: 'blur' },
  ],
});

const { mutate: registerMutation, isPending } = useMutation({
  mutationFn: $api.user.register.mutate,
  onSuccess: message => ElMessage({ message, type: 'success', showClose: true }),
  onError: err => useErrorHandler(err),
});

async function register(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid)
      registerMutation({ ...form });
    else
      ElMessage({ message: '表单内有错误，请修改后再提交', type: 'error', showClose: true });
  });
}
</script>

<style scoped lang="scss">
.register-form {
  max-width: 500px;
}
</style>
