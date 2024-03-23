<template>
  <el-card class="mb-5 w-full">
    <template #header>
      提交论文
    </template>

    <el-form
      ref="formRef"
      class="mx-auto max-w-[800px] py-5"
      :model="form" :rules="rules"
      label-width="120px"
    >
      <el-form-item prop="title" label="标题">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item prop="abstract" label="摘要">
        <el-input v-model="form.abstract" :autosize="{ minRows: 4, maxRows: 8 }" type="textarea" />
      </el-form-item>
      <el-form-item prop="keywords" label="关键词">
        <keywordEditor v-model="form.keywords" />
      </el-form-item>
      <el-form-item prop="canDownload" label="允许下载">
        <el-switch
          v-model="form.canDownload"
          size="large"
          active-text="是" inactive-text="否" inline-prompt
          style="--el-switch-on-color: #146E3C; --el-switch-off-color: #db3131;"
        />
      </el-form-item>
      <el-form-item prop="paperFile" label="论文文件">
        <UploadFile v-model="form.paperFile" is-main-file />
      </el-form-item>
      <el-form-item label="附件">
        <UploadFile v-model="form.attachments" multiple />
      </el-form-item>
      <el-form-item>
        <el-button color="#146E3C" :loading="buttonLoading" @click="create(formRef)">
          提交
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { TPaperCreateSafeForm } from '~/types/index';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '提交论文',
});

const formRef = ref<FormInstance>();
const form = reactive<TPaperCreateSafeForm>({
  title: '',
  keywords: [],
  abstract: '',
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
    { min: 1, max: 5000, message: '摘要不应超过5000个字', trigger: 'blur' },
  ],
  canDownload: [{ required: true }],
  keywords: [{ required: true, message: '关键词不能为空', trigger: 'blur' }],
  paperFile: [{ required: true, message: '请上传论文文件' }],
});

const buttonLoading = ref(false);
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      try {
        buttonLoading.value = true;
        const paperId = await $api.paper.createSafe.mutate(form);
        await $api.attachment.batchMoveToPaper.mutate({
          ids: form.paperFile.concat(form.attachments),
          paperId,
        });
        ElMessage({ message: '创建成功', type: 'success', showClose: true });
      } catch (err) {
        useErrorHandler(err);
      }
      buttonLoading.value = false;
    } else {
      ElMessage({ message: '表单内有错误，请修改后再提交', type: 'error', showClose: true });
    }
  });
}
</script>
