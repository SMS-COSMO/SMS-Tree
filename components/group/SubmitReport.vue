<template>
  <el-card class="mb-5">
    <template #header>
      提交{{ category === 'thesisProposal' ? '开题' : '结题' }}报告
    </template>

    <el-form
      ref="formRef"
      class="mx-auto max-w-[800px] lg:py-4"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      :model="form"
      :rules="rules"
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
  </el-card>
</template>

<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import type { FormInstance, FormRules } from 'element-plus';
import type { TReportCategory } from '~/types';

const props = defineProps<{
  category: TReportCategory;
}>();
const { $api } = useNuxtApp();
const device = useDevice();

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
        const reportId = await $api.report.createSafe.mutate({ category: props.category });
        await $api.attachment.batchMoveToReport.mutate({
          ids: form.documentFile.concat(form.presentationFile),
          reportId,
        });
        queryClient.invalidateQueries({ queryKey: ['groupInfo'] });
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
