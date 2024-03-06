<template>
  <el-upload
    v-model:file-list="fileList" action="" drag
    :http-request="handleUpload"
    :on-remove="handleRemove"
    :multiple="multiple" class="w-full" :limit="multiple ? 10 : 1"
  >
    <div class="el-upload__text">
      拖拽文件或 <strong>点击这里上传</strong>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        最多上传 {{ multiple ? 10 : 1 }} 个文件
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFile, UploadFiles, UploadRawFile, UploadRequestOptions } from 'element-plus';
import axios from 'axios';

const props = withDefaults(defineProps<{
  isMainFile?: boolean;
  multiple?: boolean;
}>(), {
  isMainFile: false,
  multiple: false,
});
const attachmentIdList = defineModel<string[]>({ default: [] });
const fileUidToAttachmentId = new Map<number, string>();

const { $api } = useNuxtApp();

const fileList = ref<UploadFiles>([]);
// Get file with upload meta data
function getFile(rawFile: UploadRawFile) {
  return fileList.value.find(file => file.uid === rawFile.uid);
}

async function handleUpload(option: UploadRequestOptions) {
  const key = `${makeId(10)}-${option.file.name}`;
  const { file } = option;
  const f = getFile(file);

  try {
    const url = await $api.s3.getStandardUploadPresignedUrl.mutate({ key });
    await axios.put(url, file.slice(), {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (p) => {
        if (f) {
          f.status = 'uploading';
          f.percentage = Math.round((p.progress ?? 0) * 100);
        }
      },
    });

    const id = await $api.attachment.create.mutate({
      isMainFile: props.isMainFile,
      fileType: file.type,
      name: file.name,
      S3FileId: url.split('?')[0],
    });
    attachmentIdList.value.push(id);
    fileUidToAttachmentId.set(file.uid, id);
  } catch (err) {
    if (f)
      fileList.value.splice(fileList.value.indexOf(f), 1);
    ElMessage({ message: '上传失败', type: 'error', showClose: true });
  }
}

function handleRemove(uploadFile: UploadFile) {
  attachmentIdList.value.splice(
    attachmentIdList.value.findIndex(
      v => v === fileUidToAttachmentId.get(uploadFile.uid),
    ),
    1,
  );
};
</script>
