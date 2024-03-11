<template>
  <el-form
    ref="formRef"
    class="mx-auto w-[700px] py-5"
    :model="form" :rules="rules"
    label-width="120px"
  >
    <el-form-item prop="title" label="标题">
      <el-input v-model="form.title" />
    </el-form-item>
    <el-form-item prop="abstract" label="摘要">
      <el-input v-model="form.abstract" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" />
    </el-form-item>
    <el-form-item prop="keywords" label="关键词">
      <keywordEditor v-model="form.keywords" />
    </el-form-item>
    <el-form-item prop="canDownload" label="允许下载">
      <el-switch
        v-model="form.canDownload"
        size="large"
        active-text="是" inactive-text="否" inline-prompt
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #db3131;"
      />
    </el-form-item>
    <el-form-item label="作者" />
    <el-form-item label="论文文件">
      <UploadFile v-model="paperFile" is-main-file />
    </el-form-item>
    <el-form-item label="附件">
      <UploadFile v-model="attachments" multiple />
    </el-form-item>
    <el-form-item label="评语" />
    <el-form-item>
      <el-button color="#146E3C" :loading="buttonLoading" @click="create(formRef)">
        创建
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { TPaperCreate } from '~/types/index';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '创建论文',
});

const formRef = ref<FormInstance>();
const form = reactive<TPaperCreate>({
  title: '',
  keywords: [],
  abstract: '',
  canDownload: false,
  groupId: undefined,
  comment: '',
});

const rules = reactive<FormRules<TPaperCreate>>({
  title: [
    { required: true, message: '论文标题不能为空', trigger: 'blur' },
    { min: 1, max: 256, message: '论文标题长度不应超过 256', trigger: 'blur' },
  ],
  abstract: [
    { required: true, message: '摘要不能为空', trigger: 'blur' },
    { min: 1, max: 5000, message: '摘要不应超过5000个字', trigger: 'blur' },
  ],
});
const paperFile = ref<string[]>([]);
const attachments = ref<string[]>([]);

const buttonLoading = ref(false);
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      try {
        buttonLoading.value = true;
        const paperId = await $api.paper.create.mutate(form);
        await $api.attachment.batchMoveToPaper.mutate({
          ids: paperFile.value.concat(attachments.value),
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
