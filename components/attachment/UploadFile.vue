<template>
  <el-upload v-model:file-list="fileList" action="" drag :http-request="handleUpload" multiple class="w-full">
    <div class="el-upload__text">
      拖拽文件或 <strong>点击这里上传</strong>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFiles, UploadRawFile, UploadRequestOptions } from 'element-plus';
import { nanoid } from 'nanoid';
import axios from 'axios';

const { $api } = useNuxtApp();

const fileList = ref<UploadFiles>([]);

function getFile(rawFile: UploadRawFile) {
  return fileList.value.find(file => file.uid === rawFile.uid);
}

async function handleUpload(option: UploadRequestOptions) {
  const key = `${nanoid(10)}-${option.file.name}`;
  const { file } = option;

  try {
    const url = await $api.s3.getStandardUploadPresignedUrl.mutate({ key });
    await axios.put(url, file.slice(), {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (p) => {
        const f = getFile(file);
        if (f) {
          f.status = 'uploading';
          f.percentage = Math.round((p.progress ?? 0) * 100);
        }
      },
    });
  } catch (err) {
    const f = getFile(file);
    if (f)
      fileList.value.splice(fileList.value.indexOf(f), 1);
    ElMessage({ message: '上传失败', type: 'error', showClose: true });
  }
}
</script>
