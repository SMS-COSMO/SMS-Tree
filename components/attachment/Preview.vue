<template>
  <div v-if="props.attachment">
    <iframe
      v-if="pdfFileTypes.includes(props.attachment.fileType)"
      :src="`/pdfjs-dist/web/viewer.html?file=${fileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-125'} border-normal rounded box-border`"
    />
    <iframe
      v-else-if="docxFileTypes.includes(props.attachment.fileType)"
      :src="`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-125'}`"
    />
    <el-image
      v-else-if="/^image*/.test(props.attachment.fileType)"
      class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
      :src="fileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :initial-index="4"
      :preview-src-list="[fileUrl!]"
      fit="cover"
    />
    <video v-else-if="/^video*/.test(props.attachment.fileType)" controls width="100%">
      <source :src="fileUrl" :type="props.attachment.fileType">
    </video>
    <audio v-else-if="/^audio*/.test(props.attachment.fileType)" controls :src="fileUrl" />
    <el-empty v-else :image-size="100" description="暂无预览" class="h-40" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import type { TAttachmentContent } from '~/types';

const props = withDefaults(defineProps<{
  attachment?: TAttachmentContent;
  fullHeight?: boolean;
}>(), {
  fullHeight: false,
});

const { $api } = useNuxtApp();

const { data: fileUrl, suspense } = useQuery({
  queryKey: ['fileUrl', { id: props.attachment?.S3FileId }],
  queryFn: () => $api.attachment.fileUrl.query(props.attachment!.id),
});
await suspense();

const docxFileTypes = [
  'application/msword',
  'application/wps-office.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const pdfFileTypes = ['application/pdf'];
</script>
