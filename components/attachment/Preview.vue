<template>
  <div v-if="props.attachment" class="relative">
    <el-button
      class="absolute top-[1px]"
      size="small"
      :class="[
        !pdfFileTypes.includes(props.attachment.fileType)
          && !docxFileTypes.includes(props.attachment.fileType)
          && !/^image*/.test(props.attachment.fileType)
          && !/^video*/.test(props.attachment.fileType)
          && !/^audio*/.test(props.attachment.fileType)
          ? 'w-full' : 'right-[1px]',
      ]"
      icon="i-tabler:download"
      @click="download"
    >
      下载
    </el-button>
    <iframe
      v-if="pdfFileTypes.includes(props.attachment.fileType)"
      :src="`/pdfjs-dist/web/viewer.html?file=${fileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-150'} border-normal rounded box-border`"
    />
    <iframe
      v-else-if="docxFileTypes.includes(props.attachment.fileType)"
      :src="`https://view.officeapps.live.com/op/embed.aspx?src=${rawFileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-150'}`"
    />
    <el-image
      v-else-if="/^image*/.test(props.attachment.fileType)"
      class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
      :src="rawFileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :initial-index="4"
      :preview-src-list="[rawFileUrl!]"
      fit="cover"
    />
    <video v-else-if="/^video*/.test(props.attachment.fileType)" controls width="100%">
      <source :src="rawFileUrl" :type="props.attachment.fileType">
    </video>
    <audio v-else-if="/^audio*/.test(props.attachment.fileType)" controls :src="rawFileUrl" />
    <el-empty v-else :image-size="100" description="暂无预览" class="h-60" />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { saveAs } from 'file-saver';

const props = withDefaults(defineProps<{
  attachment?: TAttachment;
  fullHeight?: boolean;
}>(), {
  fullHeight: false,
});

const { $api } = useNuxtApp();

const { data: rawFileUrl, suspense } = useQuery({
  queryKey: ['attachment.fileUrl', { id: props.attachment?.S3FileId }],
  queryFn: () => $api.attachment.fileUrl.query(props.attachment!.id),
  refetchOnWindowFocus: false,
});
await suspense();

const docxFileTypes = [
  'application/msword',
  'application/wps-office.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const pdfFileTypes = ['application/pdf'];
const fileUrl = computed(() => encodeURIComponent(rawFileUrl.value ?? ''));

async function download() {
  if (!rawFileUrl.value)
    return;
  const res = await axios.get(rawFileUrl.value, { responseType: 'blob' });
  saveAs(res.data, props.attachment?.name ?? 'untitled.pdf');
}
</script>
