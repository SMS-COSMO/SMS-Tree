<template>
  <el-card>
    <el-form ref="formRef" class="register-form mx-auto py-5" :model="form" :rules="rules" label-width="120px">
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
          v-model="form.canDownload" size="large" active-text="是" inactive-text="否" inline-prompt
          style="--el-switch-on-color: #13ce66; --el-switch-off-color: #db3131;"
        />
      </el-form-item>
      <el-form-item label="作者">
        <el-select filterable />
      </el-form-item>
      <el-form-item label="文件">
        <el-upload class="w-full">
          <el-button color="#146E3C" plain>
            点击上传文件
          </el-button>
        </el-upload>
      </el-form-item>
      <el-form-item>
        <el-button class="submit-button" color="#146E3C" :loading="buttonLoading" @click="register(formRef)">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { TCreatePaperInput } from '~/types/index';

useHeadSafe({
  title: '创建论文',
});

const formRef = ref<FormInstance>();
const form = reactive<TCreatePaperInput>({
  title: '',
  abstract: '',
  groupId: '',
  keywords: [],
  canDownload: false,
  S3FileId: '',
});

const rules = reactive<FormRules<TCreatePaperInput>>({
});

const buttonLoading = ref(false);

async function register(submittedForm: FormInstance | undefined) {
  if (!submittedForm)
    return;

  await submittedForm.validate(async (valid) => {
    if (valid)
      buttonLoading.value = true;
  });
}
</script>

<style scoped lang="scss">
.register-form {
  max-width: 700px;
}
</style>
