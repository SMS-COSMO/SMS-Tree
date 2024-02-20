<template>
  <el-button v-if="paper?.canDownload" color="#146E3C" class="mt-1 w-full" plain @click="showDialog = true;">
    下载
  </el-button>

  <el-dialog v-model="showDialog" title="文件下载">
    <el-collapse>
      <el-collapse-item
        v-for="attachment in attachments.sort((a, b) => {
          if (a.isMainFile) return -1;
          else if (b.isMainFile) return 1;
          else return 0;
        })"
        :key="attachment.id"
      >
        <template #title>
          <div class="space-x-2">
            <el-tag v-if="attachment.isMainFile" type="success">
              <el-icon><ElIconStar /></el-icon>
            </el-tag>
            <el-tag type="info">
              {{ attachment.fileType }}
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
</template>

<script setup lang="ts">
import type { TAttachmentList, TPaperContentWithAuthor } from '~/types';

const props = defineProps<{
  paper?: TPaperContentWithAuthor;
}>();

const { $api } = useNuxtApp();

const showDialog = ref(false);
const attachments = ref<TAttachmentList>([]);

watch(showDialog, async () => {
  try {
    attachments.value = await $api.paper.attachments.query({ id: props.paper!.id });
  } catch (err) {
    useErrorHandler(err);
  }
});
</script>
