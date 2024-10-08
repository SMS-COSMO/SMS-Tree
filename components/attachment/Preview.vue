<template>
  <div
    v-if="attachment"
    class="select-none"
    :class="[fullscreen ? 'fixed left-0 top-0 z-100 h-svh w-screen p-4 lg:p-9 box-border mt-0! backdrop-blur-lg bg-black/50' : 'relative']"
  >
    <el-icon v-if="fullscreen" class="i-tabler:x right-2 top-2 cursor-pointer fixed!" color="white" @click="fullscreen = false" />
    <div
      class="z-10 mb-2 flex gap-2"
      :class="[fullscreen && 'hidden!']"
    >
      <div class="hidden md:block">
        <el-button
          v-if="pdfFileTypes.includes(attachment.fileType)"
          size="small"
          :icon="`${fullscreen ? 'i-tabler:arrows-minimize' : 'i-tabler:maximize'}`"
          @click="fullscreen = !fullscreen"
        >
          {{ fullscreen ? '退出' : '全屏' }}
        </el-button>
      </div>
      <div>
        <el-button
          size="small"
          icon="i-tabler:download"
          :loading="downloading"
          @click="download"
        >
          下载
        </el-button>
      </div>
      <div>
        <chatgpt-detector v-if="admin && rawFileUrl && pdfFileTypes.includes(attachment.fileType)" :url="rawFileUrl" />
      </div>
    </div>

    <iframe
      v-if="pdfFileTypes.includes(attachment.fileType)"
      ref="target"
      :src="`/pdfjs-dist/web/viewer.html?file=${fileUrl}`" frameborder="0"
      class="box-border w-full rounded border-normal"
      :class="[fullscreen ? 'h-full' : (fullHeight ? 'h-[calc(100vh-200px)]' : 'h-150')]"
    />
    <iframe
      v-else-if="
        docxFileTypes.includes(attachment.fileType)
          || pptFileTypes.includes(attachment.fileType)
          || xlsxFileTypes.includes(attachment.fileType)
      "
      :src="`https://view.officeapps.live.com/op/embed.aspx?src=${rawFileUrl}`" frameborder="0"
      :class="`w-full ${fullHeight ? 'h-[calc(100vh-200px)]' : 'h-150'}`"
    />
    <el-image
      v-else-if="/^image*/.test(attachment.fileType)"
      class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
      :src="rawFileUrl"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :initial-index="4"
      :preview-src-list="[rawFileUrl!]"
      fit="cover"
    />
    <video v-else-if="/^video*/.test(attachment.fileType)" controls width="100%">
      <source :src="rawFileUrl" :type="attachment.fileType">
    </video>
    <audio v-else-if="/^audio*/.test(attachment.fileType)" controls :src="rawFileUrl" />
    <el-empty v-else :image-size="100" description="暂无预览" class="h-60" />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import pkg from 'file-saver';

const {
  attachment,
  fullHeight = false,
  admin = false,
} = defineProps<{
  attachment?: TAttachment;
  fullHeight?: boolean;
  admin?: boolean;
}>();

const { saveAs } = pkg;
const { $api } = useNuxtApp();

const { data: rawFileUrl, suspense } = useQuery({
  queryKey: ['attachment.fileUrl', { id: attachment?.S3FileId }],
  queryFn: () => $api.attachment.fileUrl.query(attachment!.id),
  refetchOnWindowFocus: false,
});
await suspense();

const fileUrl = computed(() => encodeURIComponent(rawFileUrl.value ?? ''));

const downloading = ref(false);
async function download() {
  if (!rawFileUrl.value)
    return;
  downloading.value = true;
  const res = await axios.get(rawFileUrl.value, { responseType: 'blob' });
  downloading.value = false;
  saveAs(res.data, attachment?.name ?? 'untitled.pdf');
}

const fullscreen = ref(false);
const target = ref(null);
onClickOutside(target, () => fullscreen.value = false);

const { escape } = useMagicKeys();
watch(escape, () => {
  fullscreen.value = false;
});
</script>
