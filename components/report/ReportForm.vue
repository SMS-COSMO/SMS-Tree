<template>
  <el-form
    ref="formRef"
    class="mx-auto max-w-[800px] md:py-4"
    :label-position="device.isMobileOrTablet ? 'top' : 'right'"
    :model="form"
    :rules="type === 'create' ? rules : {}"
    label-width="120px"
  >
    <el-form-item v-if="type === 'modify'">
      <el-alert type="info" show-icon :closable="false">
        无需修改的文件可留空。
      </el-alert>
    </el-form-item>
    <el-form-item v-if="category !== 'concludingReport'" prop="documentFile" label="报告文档">
      <UploadFile
        v-model="form.documentFile"
        v-model:uploading="uploading"
        category="reportDocument"
      />
    </el-form-item>
    <el-form-item prop="presentationFile" label="报告PPT">
      <UploadFile
        v-model="form.presentationFile"
        v-model:uploading="uploading"
        category="reportPresentation"
      />
    </el-form-item>
    <el-form-item>
      <el-button color="#15803d" :loading="buttonLoading" :disabled="uploading" @click="create(formRef)">
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';

const { type, category, reportId } = defineProps<{
  type: 'create' | 'modify';
  category: TReportCategory;
  reportId?: string;
}>();

const device = useDevice();
const { $api } = useNuxtApp();

interface TReportCreateForm { documentFile: string[]; presentationFile: string[] }

const formRef = ref<FormInstance>();
const form = reactive<TReportCreateForm>({
  documentFile: [],
  presentationFile: [],
});
const { reset } = usePreventLeave(form);

const rules = reactive<FormRules<TReportCreateForm>>({
  documentFile: [{ required: true, message: '请上传报告文档' }],
  presentationFile: [{ required: true, message: '请上传报告PPT' }],
});

const uploading = ref(false);

const queryClient = useQueryClient();
const buttonLoading = ref(false);
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      try {
        buttonLoading.value = true;
        if (type === 'create') {
          const reportId = await $api.report.createSafe.mutate({ category });
          await $api.attachment.batchMoveToReport.mutate({
            ids: form.documentFile.concat(form.presentationFile),
            reportId,
          });
        } else {
          if (!reportId) {
            useMessage({ message: '找不到报告', type: 'error' });
            return;
          }

          let modifyCategory: TAttachmentCategory | undefined;
          if (form.documentFile.length && form.presentationFile.length) {
            modifyCategory = undefined;
          } else if (form.documentFile.length && !form.presentationFile.length) {
            modifyCategory = 'reportDocument';
          } else if (!form.documentFile.length && form.presentationFile.length) {
            modifyCategory = 'reportPresentation';
          } else {
            useMessage({ message: '请上传文件', type: 'error' });
            return;
          }

          await $api.attachment.batchReplaceReport.mutate({
            ids: form.documentFile.concat(form.presentationFile),
            reportId,
            category: modifyCategory,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['group.info'] });
        useMessage({ message: `${type === 'create' ? '创建' : '修改'}成功`, type: 'success' });
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
