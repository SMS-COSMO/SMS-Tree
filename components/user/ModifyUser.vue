<template>
  <el-card>
    <el-form
      ref="formRef"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      class="mx-auto max-w-[700px]"
      :model="form" :rules="rules"
      label-width="100px"
    >
      <el-form-item prop="username" label="姓名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item prop="schoolId" label="学工号">
        <el-input v-model="form.schoolId" />
      </el-form-item>
      <el-form-item prop="role" label="用户权限">
        <client-only>
          <el-select v-model="form.role" placeholder="请选择" class="w-full">
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
        <el-button color="#146E3C" :loading="isPending" @click="modify(formRef)">
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

useHeadSafe({
  title: '创建用户',
});

const { $api } = useNuxtApp();
const device = useDevice();

const formRef = ref<FormInstance>();
const userInfo = await useTrpcAsyncData(() => $api.user.profile.query({ id: props.userId }));
const form = reactive({
  username: userInfo?.username ?? '',
  schoolId: userInfo?.schoolId ?? '',
  role: userInfo?.role ?? 'student',
  classId: userInfo?.classId ?? '',
});

const rules = reactive<FormRules<TUserRegister>> ({
  username: [
    { min: 2, max: 15, message: '姓名长度应在 2~15 之间', trigger: 'blur' },
  ],
});

const { mutate: modifyMutation, isPending } = useMutation({
  mutationFn: $api.user.modify.mutate,
  onSuccess: message => useElMessage({ message, type: 'success' }),
  onError: err => useErrorHandler(err),
});

async function modify(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid)
      modifyMutation({ id: props.userId, ...form });
    else
      useElMessage({ message: '表单内有错误，请修改后再提交', type: 'error' });
  });
}
</script>
