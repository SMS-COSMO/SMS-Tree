<template>
  <div class="h-full space-y-4">
    <el-alert v-if="!isFetching && (!classList || !classList.length) " type="error" show-icon title="发生错误">
      班级信息获取失败，请检查上一步的输入或联系管理员。
    </el-alert>
    <el-alert
      v-if="!isFetching && classList && classList.length"
      title="注意"
      type="error"
      :closable="false"
    >
      由于希悦所有班级中含有不需要的班级，请务必在希悦上查看班级信息以确认是否需要导入，并在下方取消勾选不需要的班级，否则可能导致数据导入失败。
      <br>
      提示：以B班、C班为结尾的班级通常是不需要的。
    </el-alert>

    <div v-loading="isFetching" element-loading-text="正在获取班级信息...">
      <el-checkbox-group v-model="selectedClassIds">
        <el-checkbox
          v-for="item in classList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          size="large"
          checked
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="w-full flex justify-between">
      <el-button @click="$emit('back')">
        上一步
      </el-button>
      <el-button
        :disabled="isFetching || !classList || !Object.keys(selectedClasses).length"
        @click="$emit('next', selectedClasses)"
      >
        确认导入
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  semesterId: number;
}>();

defineEmits<{ back: []; next: [value: { classId: number; name: string }[]] }>();

const { $api } = useNuxtApp();
const { data: classList, isFetching } = useQuery({
  queryKey: ['seiue.classList', props.semesterId],
  queryFn: () => $api.seiue.classList.query({ semesterId: props.semesterId }),
});

const selectedClassIds = ref<number[]>([]);
const selectedClasses = computed(() => {
  return (classList.value ?? []).reduce((acc, cur) => {
    if (selectedClassIds.value.includes(cur.id)) {
      acc.push({ classId: cur.id, name: cur.name });
    }
    return acc;
  }, [] as { classId: number; name: string }[]);
});
</script>
