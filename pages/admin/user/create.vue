<template>
  <el-card class="mb-5">
    <el-form
      ref="formRef"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      class="mx-auto max-w-[700px] py-5"
      :model="form" :rules="rules"
      label-width="100px"
    >
      <el-form-item prop="schoolId" label="学工号">
        <el-input v-model="form.schoolId" />
      </el-form-item>
      <el-form-item prop="username" label="姓名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item prop="role" label="用户权限">
        <client-only>
          <el-select v-model="form.role" placeholder="请选择">
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
            <el-option label="管理员" value="admin" />
          </el-select>
          <template #fallback>
            <SelectPlaceholder />
          </template>
        </client-only>
      </el-form-item>
      <el-form-item prop="classId" label="班级">
        <SelectClass v-model="form.classId" />
      </el-form-item>
      <el-form-item prop="groupId" label="小组">
        <SelectGroup v-model="form.groupId" />
      </el-form-item>
      <el-form-item>
        <el-button color="#15803d" :loading="isPending" @click="register(formRef)">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

useHeadSafe({
  title: '创建用户',
});

const { $api } = useNuxtApp();
const device = useDevice();

const formRef = ref<FormInstance>();
const form = reactive<TUserRegister>({
  schoolId: '',
  username: '',
  password: '',
  role: 'student',
  classId: '',
  groupId: '',
});
usePreventLeave(form);

const rules = reactive<FormRules<TUserRegister>>({
  schoolId: [
    { required: true, message: '学号 / 用户名不能为空', trigger: 'blur' },
    { min: 4, max: 24, message: '学号 / 用户名长度应在 4~24 之间', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
    { min: 2, max: 15, message: '姓名长度应在 2~15 之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位' },
    { pattern: passwordRegex, message: '密码必须包含大小写字母、数字与特殊符号' },
  ],
  role: [{ required: true }],
});

const { mutate: registerMutation, isPending } = useMutation({
  mutationFn: $api.user.register.mutate,
  onSuccess: message => useMessage({ message, type: 'success' }),
  onError: err => useErrorHandler(err),
});

async function register(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid)
      registerMutation({ ...form });
    else
      useMessage({ message: '表单内有错误，请修改后再提交', type: 'error' });
  });
}
</script>
