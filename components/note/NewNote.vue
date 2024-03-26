<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!" @click="dialogVisible = true">
    <el-icon size="16px">
      <ElIconPlus />
    </el-icon>
    <span class="text-[16px]">
      创建新的活动记录
    </span>
  </el-card>

  <client-only>
    <el-dialog
      v-model="dialogVisible"
      align-center
      draggable
      title="创建活动记录"
    >
      <el-form
        ref="formRef"
        class="mx-auto max-w-[800px] px-4 py-4"
        :model="form" :rules="rules"
        label-width="120px"
      >
        <el-form-item prop="title" label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item prop="time" label="时间">
          <el-date-picker
            v-model="form.time"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item prop="followUp" label="上次活动跟进">
          <el-input v-model="form.followUp" :autosize="{ minRows: 3, maxRows: 5 }" type="textarea" />
        </el-form-item>
        <el-form-item prop="newDiscussion" label="新的讨论内容">
          <el-input v-model="form.newDiscussion" :autosize="{ minRows: 3, maxRows: 5 }" type="textarea" />
        </el-form-item>
        <el-form-item prop="content" label="活动笔记">
          <el-input v-model="form.content" :autosize="{ minRows: 3, maxRows: 8 }" type="textarea" />
        </el-form-item>
        <el-form-item prop="plans" label="下次活动计划">
          <el-input v-model="form.plans" :autosize="{ minRows: 3, maxRows: 5 }" type="textarea" />
        </el-form-item>
        <el-form-item prop="reflections" label="反思">
          <el-input v-model="form.reflections" :autosize="{ minRows: 3, maxRows: 5 }" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button color="#146E3C" :loading="isPending" @click="create(formRef)">
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TNoteCreateSafe } from '~/types/index';

const { $api } = useNuxtApp();

const dialogVisible = ref(false);

const formRef = ref<FormInstance>();
const form = reactive<TNoteCreateSafe>({
  title: '',
  content: '',
  followUp: '',
  newDiscussion: '',
  plans: '',
  reflections: '',
  time: new Date(),
});

const rules = reactive<FormRules<TNoteCreateSafe>>({
  title: [
    { required: true, message: '活动记录主题不能为空', trigger: 'blur' },
    { min: 1, max: 256, message: '活动记录主题长度不应超过 256', trigger: 'blur' },
  ],
  time: [
    { required: true, message: '请填写时间', trigger: 'blur' },
  ],
  followUp: [
    { required: true, message: '上次活动跟进不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '上次活动跟进不应超过1000个字', trigger: 'blur' },
  ],
  newDiscussion: [
    { required: true, message: '新的讨论内容不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '新的讨论内容不应超过1000个字', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '活动笔记不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '活动笔记不应超过1000个字', trigger: 'blur' },
  ],
  plans: [
    { required: true, message: '下次活动计划不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '下次活动计划不应超过1000个字', trigger: 'blur' },
  ],
  reflections: [
    { required: true, message: '反思不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '反思不应超过1000个字', trigger: 'blur' },
  ],
});

const queryClient = useQueryClient();
const { mutate: submitNote, isPending } = useMutation({
  mutationFn: $api.note.createSafe.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
    ElMessage({ message: '创建成功', type: 'success', showClose: true });
  },
  onError: err => useErrorHandler(err),
});

async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid)
      submitNote(form);
    else
      ElMessage({ message: '表单内有错误，请修改后再提交', type: 'error', showClose: true });
  });
}
</script>
