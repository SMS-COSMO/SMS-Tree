<template>
  <el-button
    v-if="canDownload || ['teacher', 'admin'].includes(userStore.role)"
    color="#146E3C" class="mt-1 w-full" plain @click="showDialog = true;"
  >
    下载
  </el-button>

  <client-only>
    <el-dialog v-model="showDialog" title="文件下载">
      <el-collapse v-if="attachments?.length">
        <el-collapse-item
          v-for="attachment in attachments"
          :key="attachment.id"
        >
          <template #title>
            <div class="space-x-2">
              <el-button
                icon="i-tabler:download"
                size="small" text bg circle
                @click="downloadFile(attachment.id)"
              />
              <el-tag v-if="attachment.category === 'paperDocument'" type="success">
                <el-icon class="i-tabler:star" />
              </el-tag>
              <span class="text-[15px]">
                {{ attachment.name }}
              </span>
            </div>
          </template>
          <Preview :attachment="attachment" />
        </el-collapse-item>
      </el-collapse>
      <el-empty v-else :image-size="150" description="无文件" />
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
const props = defineProps<{
  paperId?: string;
  canDownload?: boolean;
  attachments?: TAttachment[];
}>();

const { $api } = useNuxtApp();
const userStore = useUserStore();

let firstOpen = true;
const showDialog = ref(false);

watch(showDialog, async () => {
  try {
    if (showDialog.value && firstOpen) {
      await $api.paper.updateDownloadCount.mutate({ id: props.paperId! });
      firstOpen = false;
    }
  } catch (err) {
    useErrorHandler(err);
  }
});

async function downloadFile(id: string) {
  const url = await useTrpcAsyncData<string>(() => $api.attachment.fileUrl.query(id));
  navigateTo(url, { external: true });
}
</script>
