<template>
  <el-card class="min-h-admin-content">
    <AdminBreadcrumb />
    <el-form
      ref="formRef"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      class="mx-auto max-w-[800px] py-5"
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
        <keywordEditor v-model="form.keywords" />
      </el-form-item>
      <el-form-item prop="isPublic" label="是否公开">
        <el-switch
          v-model="form.isPublic" size="large" active-text="是" inactive-text="否" inline-prompt
          style="--el-switch-on-color: #15803d; --el-switch-off-color: #db3131;"
        />
      </el-form-item>
      <el-form-item prop="canDownload" label="允许下载">
        <el-switch
          v-model="form.canDownload" size="large" active-text="是" inactive-text="否" inline-prompt
          style="--el-switch-on-color: #15803d; --el-switch-off-color: #db3131;"
        />
      </el-form-item>
      <el-form-item prop="isFeatured" label="优秀">
        <el-switch
          v-model="form.isFeatured" size="large" active-text="是" inactive-text="否" inline-prompt
          style="--el-switch-on-color: #15803d; --el-switch-off-color: #db3131;"
        />
      </el-form-item>
      <el-form-item prop="groupId" label="小组">
        <SelectGroup v-model="form.groupId" />
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
      <el-form-item label="评语">
        <TiptapEditor v-model="form.comment" />
      </el-form-item>
      <el-form-item>
        <el-button color="#15803d" :loading="buttonLoading" :disabled="uploading" @click="create(formRef)">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const { $api } = useNuxtApp();
const device = useDevice();
useHeadSafe({
  title: '创建论文',
});

const formRef = ref<FormInstance>();
const form = reactive<TPaperCreateForm>({
  title: '',
  abstract: '',
  category: 0,
  keywords: [],
  canDownload: false,
  groupId: '',
  comment: undefined,
  isFeatured: false,
  isPublic: false,
  paperFile: [],
  attachments: [],
});

const { reset } = usePreventLeave(form);
const uploading = ref(false);

const rules = reactive<FormRules<TPaperCreateForm>>({
  title: [
    { required: true, message: '论文标题不能为空', trigger: 'blur' },
    { min: 1, max: 256, message: '论文标题长度不应超过 256', trigger: 'blur' },
  ],
  abstract: [
    { required: true, message: '摘要不能为空', trigger: 'blur' },
    { min: 1, max: 5000, message: '摘要不应超过5000个字', trigger: 'blur' },
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'blur' }],
  keywords: [{ required: true, message: '关键词不能为空', trigger: 'blur' }],
  canDownload: [{ required: true }],
  groupId: [{ required: true, message: '' }],
  isPublic: [{ required: true }],
  isFeatured: [{ required: true }],
  paperFile: [{ required: true, message: '请上传论文文件' }],
});

const buttonLoading = ref(false);
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid && form.category >= 0) {
      try {
        buttonLoading.value = true;
        const paperId = await $api.paper.create.mutate(form);
        await $api.attachment.batchMoveToPaper.mutate({
          ids: form.paperFile.concat(form.attachments),
          paperId,
        });
        useMessage({ message: '创建成功', type: 'success' });
        resetForm(submittedForm);
      } catch (err) {
        useErrorHandler(err);
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
}
</script>
