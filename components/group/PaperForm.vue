<template>
  <el-form
    ref="formRef"
    class="mx-auto max-w-[800px] md:py-4"
    :label-position="device.isMobileOrTablet ? 'top' : 'right'"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item prop="title" label="标题">
      <el-input v-model="form.title" />
    </el-form-item>
    <el-form-item prop="abstract" label="摘要">
      <el-input v-model="form.abstract" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" />
    </el-form-item>
    <el-form-item prop="category" label="分类">
      <CategorySelect v-model="form.category" />
    </el-form-item>
    <el-form-item prop="keywords" label="关键词">
      <KeywordEditor v-model="form.keywords" />
    </el-form-item>
    <el-form-item prop="canDownload" label="允许下载">
      <el-switch
        v-model="form.canDownload"
        size="large"
        active-text="是" inactive-text="否" inline-prompt
        style="--el-switch-on-color: #15803d; --el-switch-off-color: #db3131;"
      />
    </el-form-item>
    <el-form-item prop="paperFile" label="论文文件">
      <UploadFile
        v-model="form.paperFile"
        v-model:uploading="uploading"
        category="paperDocument"
      />
    </el-form-item>
    <el-form-item prop="attachments" label="附件">
      <UploadFile
        v-model="form.attachments"
        v-model:uploading="uploading"
        multiple
        category="paperAttachment"
      />
    </el-form-item>
    <el-form-item>
      <el-button
        color="#15803d"
        :loading="buttonLoading"
        :disabled="uploading"
        @click="create(formRef)"
      >
        {{ type === 'create' ? '提交' : '修改' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const props = defineProps<{
  type: 'create' | 'modify';
  oldPaper?: TPaperCreateSafeForm;
  paperId?: string;
}>();
const emit = defineEmits(['reset']);

const { $api } = useNuxtApp();
const device = useDevice();

const formRef = ref<FormInstance>();
const form = ref<TPaperCreateSafeForm>(props.oldPaper ?? {
  title: '',
  abstract: '',
  category: 0,
  keywords: [],
  canDownload: false,
  paperFile: [],
  attachments: [],
});

const rules = reactive<FormRules<TPaperCreateSafeForm>>({
  title: [
    { required: true, message: '论文标题不能为空', trigger: 'blur' },
    { min: 1, max: 256, message: '论文标题长度不应超过 256', trigger: 'blur' },
  ],
  abstract: [
    { required: true, message: '摘要不能为空', trigger: 'blur' },
    { min: 1, max: 1000, message: '摘要不应超过1000个字', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'blur' }],
  keywords: [{ required: true, message: '关键词不能为空', trigger: 'blur' }],
  canDownload: [{ required: true }],
  paperFile: props.type === 'create' ? [{ required: true, message: '请上传论文文件' }] : undefined,
});

const buttonLoading = ref(false);
const uploading = ref(false);

const { reset } = usePreventLeave(form);

const queryClient = useQueryClient();
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid && form.value.category >= 0) {
      buttonLoading.value = true;
      if (props.type === 'create') {
        try {
          const paperId = await $api.paper.createSafe.mutate(form.value);
          await $api.attachment.batchMoveToPaper.mutate({
            ids: form.value.paperFile.concat(form.value.attachments),
            paperId,
          });
          queryClient.invalidateQueries({ queryKey: ['group.info'] });
          useMessage({ message: '创建成功', type: 'success' });
          resetForm(submittedForm);
        } catch (err) {
          useErrorHandler(err);
        }
      } else {
        if (!props.paperId) {
          useMessage({ message: '找不到论文', type: 'error' });
          return;
        }

        try {
          await $api.paper.modifySafe.mutate({ id: props.paperId, ...form.value });
          if (form.value.paperFile.length) {
            await $api.attachment.batchReplacePaper.mutate({
              ids: form.value.paperFile,
              paperId: props.paperId,
              category: 'paperDocument',
            });
          }
          if (form.value.attachments.length) {
            await $api.attachment.batchReplacePaper.mutate({
              ids: form.value.attachments,
              paperId: props.paperId,
              category: 'paperAttachment',
            });
          }
          useMessage({ message: '修改成功', type: 'success' });
          await queryClient.invalidateQueries({ queryKey: ['paper.info', { id: props.paperId }] });
          resetForm(submittedForm);
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
  if (props.oldPaper)
    form.value = props.oldPaper;
  reset();
  emit('reset');
}
</script>
