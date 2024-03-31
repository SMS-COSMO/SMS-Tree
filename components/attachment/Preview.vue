<template>
  <div v-if="attachment">
    <iframe
      v-if="docxFileTypes.includes(attachment.fileType)"
      :src="`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-125'}`"
    />
    <iframe
      v-else-if="pdfFileTypes.includes(attachment.fileType)"
      :src="fileUrl" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-125'}`"
    />
    <el-image
      v-else-if="/^image*/.test(attachment.fileType)"
      class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
      :src="fileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :initial-index="4"
      :preview-src-list="[fileUrl!]"
      fit="cover"
    />
    <video v-else-if="/^video*/.test(attachment.fileType)" controls width="100%">
      <source :src="fileUrl" :type="attachment.fileType">
    </video>
    <audio v-else-if="/^audio*/.test(attachment.fileType)" controls :src="fileUrl" />
    <el-empty v-else :image-size="100" description="暂无预览" class="h-40" />
  </div>
</template>

<script setup lang="ts">
import { useTrpcAsyncData } from '../../composables/trpcAsyncData';
import type { TAttachmentContent } from '~/types';

const props = withDefaults(defineProps<{
  attachment?: TAttachmentContent;
  fullHeight?: boolean;
}>(), {
  fullHeight: false,
});

const { attachment, fullHeight } = toRefs(props);

const { $api } = useNuxtApp();

const fileUrl = attachment ? await (useTrpcAsyncData<string>(() => $api.attachment.fileUrl.query(attachment.id))) : undefined;

const docxFileTypes = [
  'application/msword',
  'application/wps-office.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const pdfFileTypes = ['application/pdf'];
</script>
