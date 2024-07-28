<template>
  <el-scrollbar height="80svh">
    <el-form
      ref="formRef"
      class="mx-auto max-w-[800px] md:p-4"
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
        <TiptapEditor v-model="form.followUp" />
      </el-form-item>
      <el-form-item prop="newDiscussion" label="新的讨论内容">
        <TiptapEditor v-model="form.newDiscussion" />
      </el-form-item>
      <el-form-item prop="content" label="活动笔记">
        <TiptapEditor v-model="form.content" />
      </el-form-item>
      <el-form-item prop="plans" label="下次活动计划">
        <TiptapEditor v-model="form.plans" />
      </el-form-item>
      <el-form-item prop="reflections" label="反思">
        <TiptapEditor v-model="form.reflections" />
      </el-form-item>
      <el-form-item prop="attachments" label="附件">
        <UploadFile
          v-model="form.attachments"
          v-model:uploading="uploading"
          multiple
          category="noteAttachment"
        />
        <el-alert v-if="type === 'modify'" type="info" show-icon :closable="false">
          附件无需修改可留空，若要修改请重新上传所有附件。
        </el-alert>
      </el-form-item>
      <el-form-item>
        <el-button
          color="#15803d"
          :loading="buttonLoading"
          :disabled="uploading"
          @click="submit(formRef)"
        >
          {{ type === 'create' ? '创建' : '修改' }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-scrollbar>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const props = defineProps<{
  type: 'create' | 'modify';
  oldNote?: TNoteCreateSafeForm;
  noteId?: string;
  admin?: boolean;
}>();

const emit = defineEmits(['reset']);

const { $api } = useNuxtApp();
const device = useDevice();
const formRef = ref<FormInstance>();
const form = ref<TNoteCreateSafeForm>(props.oldNote ?? {
  title: '',
  content: '',
  followUp: '',
  newDiscussion: '',
  plans: '',
  reflections: '',
  time: new Date(),
  attachments: [],
});
const { reset } = usePreventLeave(form);

const rules = reactive<FormRules<TNoteCreateSafeForm>>({
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

const buttonLoading = ref(false);
async function submit(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      buttonLoading.value = true;
      if (props.type === 'create') {
        try {
          const noteId = await $api.note.createSafe.mutate(form.value);
          if (form.value.attachments.length) {
            await $api.attachment.batchMoveToNote.mutate({
              ids: form.value.attachments,
              noteId,
            });
          }
          queryClient.invalidateQueries({ queryKey: ['group.info'] });
          useMessage({ message: '创建成功', type: 'success' });
          resetForm(submittedForm);
        } catch (err) {
          useErrorHandler(err);
        }
      } else if (props.noteId) {
        try {
          if (props.admin)
            await $api.note.modify.mutate({ id: props.noteId, ...form.value });
          else
            await $api.note.modifySafe.mutate({ id: props.noteId, ...form.value });
          if (form.value.attachments.length) {
            await $api.attachment.batchReplaceNote.mutate({
              ids: form.value.attachments,
              noteId: props.noteId,
              category: 'noteAttachment',
            });
          }
          queryClient.invalidateQueries({ queryKey: ['group.info'] });
          queryClient.invalidateQueries({ queryKey: ['class.info'] });
          useMessage({ message: '修改成功', type: 'success' });
          resetForm(formRef.value);
        } catch (err) {
          useErrorHandler(err);
        }
      }
      buttonLoading.value = false;
    } else {
      useMessage({ message: '表单内有错误，请修改后再提交', type: 'error' });
    }
  });
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  formEl.resetFields();
  reset();
  emit('reset');
}

const uploading = ref(false);
</script>
