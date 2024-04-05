<template>
  <el-form
    ref="formRef"
    class="mx-auto max-w-[800px] lg:py-4"
    :label-position="device.isMobileOrTablet ? 'top' : 'right'"
    :model="form"
    :rules="type === 'create' ? rules : {}"
    label-width="120px"
  >
    <el-form-item prop="documentFile" label="报告文档">
      <UploadFile v-model="form.documentFile" category="reportDocument" />
    </el-form-item>
    <el-form-item prop="presentationFile" label="报告PPT">
      <UploadFile v-model="form.presentationFile" category="reportPresentation" />
    </el-form-item>
    <el-form-item>
      <el-button color="#146E3C" :loading="buttonLoading" @click="create(formRef)">
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TAttachmentCategory, TReportCategory } from '~/types';

const props = defineProps<{
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

const rules = reactive<FormRules<TReportCreateForm>>({
  documentFile: [{ required: true, message: '请上传报告文档' }],
  presentationFile: [{ required: true, message: '请上传报告PPT' }],
});

const queryClient = useQueryClient();
const buttonLoading = ref(false);
async function create(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid) {
      try {
        buttonLoading.value = true;
        if (props.type === 'create') {
          const reportId = await $api.report.createSafe.mutate({ category: props.category });
          await $api.attachment.batchMoveToReport.mutate({
            ids: form.documentFile.concat(form.presentationFile),
            reportId,
          });
        } else {
          if (!props.reportId) {
            useElMessage({ message: '找不到报告', type: 'error' });
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
            useElMessage({ message: '请上传文件', type: 'error' });
            return;
          }

          await $api.attachment.batchReplaceReport.mutate({
            ids: form.documentFile.concat(form.presentationFile),
            reportId: props.reportId,
            category: modifyCategory,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
        useElMessage({ message: `${props.type === 'create' ? '创建' : '修改'}成功`, type: 'success' });
      } catch (err) {
        useErrorHandler(err);
      }
      buttonLoading.value = false;
    } else {
      useElMessage({ message: '表单内有错误，请修改后再提交', type: 'error' });
    }
  });
}
</script>
