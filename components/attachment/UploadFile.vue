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
        最多上传 {{ multiple ? 10 : 1 }} 个文件，大小不超过
        {{ category === 'paperAttachment' ? '50MB' : '30MB' }}
        <template v-if="category !== 'paperAttachment' && category !== 'noteAttachment'">
          ，仅允许上传 PDF
          <ConvertToPDF class="ml-1" />
        </template>
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFile, UploadFiles, UploadRawFile, UploadRequestOptions } from 'element-plus';
import axios from 'axios';

const props = withDefaults(defineProps<{
  category: TAttachmentCategory;
  multiple?: boolean;
}>(), {
  multiple: false,
});

const uploading = defineModel<boolean>('uploading');

const attachmentIdList = defineModel<string[]>({ default: [] });
const fileList = ref<UploadFiles>([]);

watch(attachmentIdList, (v) => {
  if (!v.length)
    fileList.value = [];
});

const { $api } = useNuxtApp();

const fileUidToAttachmentId = new Map<number, string>();

// Get file with upload meta data
function getFile(rawFile: UploadRawFile): UploadFile | undefined {
  return fileList.value.find(file => file.uid === rawFile.uid);
}

function removeFileFromList(f: UploadFile | undefined, message: string) {
  if (f)
    fileList.value.splice(fileList.value.indexOf(f), 1);
  useMessage({ message, type: 'error' });
}

async function handleUpload(option: UploadRequestOptions) {
  uploading.value = true;
  const { file } = option;
  const f = getFile(file);
  if (!allowFileType[props.category].includes(file.type)) {
    removeFileFromList(f, '不支持的文件类型');
    if (f)
      handleRemove(f);
    uploading.value = false;
    return;
  }

  // f.size in bytes
  const sizeLimit = props.category === 'paperAttachment'
    ? 50000000 // 50mb
    : 100000000; // 100mb
  if (f?.size && f.size > sizeLimit) {
    removeFileFromList(f, `文件大小不应超过 ${Math.round(sizeLimit / 10 ** 6)}MB，当前文件大小：${Math.round(f.size / 10 ** 6)}MB`);
    handleRemove(f);
    uploading.value = false;
    return;
  }

  try {
    const { id, url } = await $api.attachment.create.mutate({
      category: props.category,
      fileType: file.type,
      name: file.name,
    });
    attachmentIdList.value.push(id);
    fileUidToAttachmentId.set(file.uid, id);
    await axios.put(url, file.slice(), {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (p) => {
        const percentage = Math.round((p.progress ?? 0) * 100);
        if (f) {
          f.status = 'uploading';
          f.percentage = percentage;
        }
      },
    });
  } catch {
    removeFileFromList(f, '上传失败');
  }
  uploading.value = false;
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
  useMessage({ message: '超出文件数量限制', type: 'error' });
}
</script>
