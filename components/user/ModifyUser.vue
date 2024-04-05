<template>
  <el-card>
    <el-form
      ref="formRef"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      class="mx-auto max-w-[500px]"
      :model="form" :rules="rules"
    >
      <el-form-item prop="username">
        <div>
          <el-icon :size="15">
            <ElIconUser />
          </el-icon>
          姓名
        </div>
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item>
        <div>
          <el-icon :size="15">
            <ElIconOperation />
          </el-icon>
          用户权限
        </div>
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
import { useMutation } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TUserRegister } from '~/types/index';

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
  role: userInfo?.role ?? 'student',
});

const rules = reactive<FormRules<TUserRegister>> ({
  username: [
    { required: true, message: '姓名不能为空', trigger: 'blur' },
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
