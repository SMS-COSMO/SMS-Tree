<template>
  <el-button
    size="small"
    icon="i-tabler:brand-openai"
    @click="dialogVisible = true"
  >
    ChatGPT 检测
  </el-button>

  <el-dialog
    v-model="dialogVisible"
    width="500"
    align-center
  >
    <template #title>
      <el-icon class="i-tabler:brand-openai" />
      ChatGPT 检测
      <el-popover
        placement="top-start"
        title="注意"
        :width="200"
        trigger="hover"
      >
        <template #reference>
          <el-icon class="i-tabler:info-circle ml-2" />
        </template>
        检测不能保证完全准确，请以实际情况为准。
      </el-popover>
    </template>

    <div class="grid grid-cols-2 mb-4">
      <el-statistic title="页数" :value="pdf.numPages" />
      <el-statistic title="字数" :value="text.length" />
    </div>
    <el-progress
      v-if="isPending"
      :percentage="100"
      :indeterminate="true"
      :show-text="false"
    />
    <el-alert v-else-if="isError" type="error" show-icon title="检测失败" class="w-full flex" close-text="重试" @close="() => refetch()" />
    <template v-else>
      <div class="mb-1 text-lg font-bold">
        {{ Math.abs(score * 100).toFixed(2) }}% {{ score > 0 ? '人类' : 'ChatGPT' }}
      </div>

      <div class="flex gap-1">
        <el-popover
          v-for="(item, i) in data"
          :key="i"
          placement="bottom-start"
          :title="`第 ${i + 1} 段`"
          :width="500"
          trigger="hover"
        >
          <template #reference>
            <div
              class="h-4 w-full rounded-sm"
              :class="[item[0].label === 'ChatGPT' ? 'bg-red' : 'bg-primary-1']"
            />
          </template>
          <div class="text-lg font-bold">
            {{ Math.abs(item[0].score * 100).toFixed(2) }}% {{ item[0].label === 'Human' ? '人类' : 'ChatGPT' }}
          </div>
          <div class="text-xs">
            {{ splitText[i] }}
          </div>
        </el-popover>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
const { url } = defineProps<{
  url: string;
}>();

const dialogVisible = ref(false);

// @ts-expect-error: importing from pdfjs
const pdfjs = await import('pdfjs-dist/build/pdf');
// @ts-expect-error importing from pdfjs
await import('pdfjs-dist/build/pdf.worker');
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.url}pdfjs-dist/build/pdf.worker.mjs`;

const pdf = await pdfjs.getDocument(url).promise;

const text = ref('');
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const textContent = await page.getTextContent();
  for (const item of textContent.items)
    text.value += item.str.replace(/[^\w\s\u4E00-\u9FA5\u3001-\u303F.,!?;:'"\-]/g, '');
}

const splitText = text.value.match(/.{1,500}/g) ?? [];

const { data, isPending, isError, refetch } = useQuery({
  queryKey: ['chatgpt-detector', url],
  queryFn: () => $fetch<[{ label: 'ChatGPT' | 'Human'; score: number }][]>(useRuntimeConfig().public.CHATGPT_DETECTOR_API, {
    method: 'POST',
    body: {
      text: text.value,
    },
  }),
  enabled: dialogVisible,
  refetchOnWindowFocus: false,
  retry: 2,
});

// 1: 100% Human
// -1: 100% ChatGPT
const score = computed(() => {
  let scoreSum = 0;
  for (const res of data.value ?? []) {
    scoreSum += (res[0]?.label === 'ChatGPT' ? -1 : 1) * res[0]?.score;
  }

  if (!data.value?.length)
    return 0;
  return scoreSum / data.value.length;
});
</script>
