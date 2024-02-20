<template>
  <iframe
    v-if="docxFileTypes.includes(attachment.fileType)"
    :src="`https://view.officeapps.live.com/op/embed.aspx?src=${attachment.S3FileId}`" frameborder="0"
    class="content"
  />
  <iframe
    v-else-if="pdfFileTypes.includes(attachment.fileType)"
    :src="attachment.S3FileId" frameborder="0" class="content"
  />
  <el-image
    v-else-if="/^image*/.test(attachment.fileType)"
    class="h-40 w-40 rounded-lg shadow transition-all hover:shadow-md"
    :src="attachment.S3FileId"
    :zoom-rate="1.2"
    :max-scale="7"
    :min-scale="0.2"
    :initial-index="4"
    :preview-src-list="[attachment.S3FileId!]"
    fit="cover"
  />
  <video v-else-if="/^video*/.test(attachment.fileType)" controls width="100%">
    <source :src="attachment.S3FileId" :type="attachment.fileType">
  </video>
  <audio v-else-if="/^audio*/.test(attachment.fileType)" controls :src="attachment.S3FileId" />
  <el-empty v-else :image-size="100" description="暂无预览" class="h-40" />
</template>

<script setup lang="ts">
import type { TAttachmentContent } from '~/types';

defineProps<{
  attachment: TAttachmentContent;
}>();

const docxFileTypes = [
  'application/msword',
  'application/wps-office.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const pdfFileTypes = ['application/pdf'];
</script>

<style lang="scss">
.content {
  width: 100%;
  height: 500px;
}
</style>
