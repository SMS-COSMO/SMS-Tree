<template>
  <el-button v-if="canDownload" color="#146E3C" class="mt-1 w-full" plain @click="showDialog = true;">
    下载
  </el-button>

  <client-only>
    <el-dialog v-model="showDialog" title="文件下载">
      <el-collapse>
        <el-collapse-item
          v-for="attachment in attachments?.toSorted((a, b) => {
            if (a.isMainFile) return -1;
            else if (b.isMainFile) return 1;
            else return 0;
          })"
          :key="attachment.id"
        >
          <template #title>
            <div class="space-x-2">
              <el-button
                tag="a"
                :href="attachment.S3FileId"
                target="_blank"
                :icon="ElIconDownload" size="small" text bg circle
              />
              <el-tag v-if="attachment.isMainFile" type="success">
                <el-icon><ElIconStar /></el-icon>
              </el-tag>
              <span class="text-[15px]">
                {{ attachment.name }}
              </span>
            </div>
          </template>
          <Preview :attachment="attachment" />
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import type { TAttachmentList } from '~/types';

const props = defineProps<{
  paperId?: string;
  canDownload?: boolean;
  attachments?: TAttachmentList;
}>();

const { $api } = useNuxtApp();

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
</script>
