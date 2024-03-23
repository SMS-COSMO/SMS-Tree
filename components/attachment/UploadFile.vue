<template>
  <el-upload
    v-model:file-list="fileList"
    action="" drag
    :multiple="multiple"
    :limit="multiple ? 10 : 1"
    :http-request="handleUpload"
    :on-remove="handleRemove"
    :on-exceed="handleExceed"
    class="w-full"
  >
    <div class="el-upload__text">
      拖拽文件或 <strong>点击这里上传</strong>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        最多上传 {{ multiple ? 10 : 1 }} 个文件，大小不超过 {{ isMainFile ? '30MB' : '50MB' }}{{ isMainFile ? '，仅允许上传 PDF' : '' }}
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFile, UploadFiles, UploadRawFile, UploadRequestOptions } from 'element-plus';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { allowedMainFileTypes, allowedSecondaryFileTypes } from '~/constants/fileType';

const props = withDefaults(defineProps<{
  isMainFile?: boolean;
  multiple?: boolean;
  mainSizeLimit?: number;
  secondarySizeLimit?: number;
}>(), {
  isMainFile: false,
  multiple: false,
  mainSizeLimit: 30000000, // 30MB
  secondarySizeLimit: 50000000, // 50MB
});
const attachmentIdList = defineModel<string[]>({ default: [] });
const fileUidToAttachmentId = new Map<number, string>();

const { $api } = useNuxtApp();

const fileList = ref<UploadFiles>([]);
// Get file with upload meta data
function getFile(rawFile: UploadRawFile): UploadFile | undefined {
  return fileList.value.find(file => file.uid === rawFile.uid);
}

function removeFileFromList(f: UploadFile | undefined, message: string) {
  if (f)
    fileList.value.splice(fileList.value.indexOf(f), 1);
  ElMessage({ message, type: 'error', showClose: true });
}

async function handleUpload(option: UploadRequestOptions) {
  const key = `${nanoid(10)}-${option.file.name}`;
  const { file } = option;
  const f = getFile(file);

  if (
    (props.isMainFile && !allowedMainFileTypes.includes(file.type))
    || (!props.isMainFile && !allowedSecondaryFileTypes.includes(file.type))
  ) {
    removeFileFromList(f, '不支持的文件类型');
    if (f)
      handleRemove(f);
    return;
  }

  // f.size in bytes
  const sizeLimit = props.isMainFile ? props.mainSizeLimit : props.secondarySizeLimit;
  if (f?.size && f.size > sizeLimit) {
    removeFileFromList(f, `文件大小不应超过 ${Math.round(sizeLimit / 10 ** 6)}MB，当前文件大小：${Math.round(f.size / 10 ** 6)}MB`);
    handleRemove(f);
    return;
  }

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
    removeFileFromList(f, '上传失败');
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

function handleExceed() {
  ElMessage({ message: '超出文件数量限制', type: 'error', showClose: true });
}
</script>
