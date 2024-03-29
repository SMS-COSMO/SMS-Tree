<template>
  <el-form
    ref="formRef"
    class="mx-auto max-w-[800px] px-4 py-4"
    :label-position="device.isMobileOrTablet ? 'top' : 'right'"
    :model="form"
    :rules="rules"
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
      <el-button color="#146E3C" :loading="isSubmitPending || isModifyPending" @click="submit(formRef)">
        {{ type === 'create' ? '创建' : '修改' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TRawNote } from '~/server/db/db';
import type { TNoteCreateSafe } from '~/types/index';

const props = defineProps<{
  type: 'create' | 'modify';
  oldNote?: TRawNote;
}>();

const { $api } = useNuxtApp();
const device = useDevice();
const formRef = ref<FormInstance>();
const form = ref<TNoteCreateSafe>({
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
const { mutate: submitNote, isPending: isSubmitPending } = useMutation({
  mutationFn: $api.note.createSafe.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
    ElMessage({ message: '创建成功', type: 'success', showClose: true });
  },
  onError: err => useErrorHandler(err),
});

const { mutate: modifyNote, isPending: isModifyPending } = useMutation({
  mutationFn: $api.note.modifySafe.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
    ElMessage({ message: '修改成功', type: 'success', showClose: true });
  },
  onError: err => useErrorHandler(err),
});

onMounted(() => {
  if (props.oldNote) {
    const { id: _, ...rest } = props.oldNote;
    form.value = rest;
  }
});

async function submit(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      if (props.type === 'create')
        submitNote(form.value);
      else if (props.oldNote?.id)
        modifyNote({ id: props.oldNote.id, ...form.value });
    } else { ElMessage({ message: '表单内有错误，请修改后再提交', type: 'error', showClose: true }); }
  });
}
</script>
