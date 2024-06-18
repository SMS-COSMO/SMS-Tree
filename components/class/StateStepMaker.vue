<template>
  <client-only>
    <el-steps
      finish-status="wait"
      class="w-full"
      direction="horizontal"
      :active="100"
    >
      <el-step
        v-for="s in [0, 1, 2, 3, 4]"
        :key="s"
        :icon="classStateIcons[s]"
        :title="classStateNames[s]"
        :class="s === 4 ? 'is-flex' : ''"
      >
        <template #description>
          <el-date-picker
            v-model="l[s]"
            type="date"
            class="max-w-40!"
            placeholder="选择日期"
            :clearable="false"
            @change="emit('update:modelValue', l)"
          />
        </template>
      </el-step>
    </el-steps>
  </client-only>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: Date[] | undefined;
}>();
const emit = defineEmits(['update:modelValue']);
const l = ref(props.modelValue ?? ([...Array(5)].map((_, i) => i === 0 ? new Date() : undefined)));

watch(() => props.modelValue, (v) => {
  if (!v?.length)
    l.value = ([...Array(5)].map((_, i) => i === 0 ? new Date() : undefined));
});

const classStateIcons = [
  'i-tabler-clock',
  'i-tabler:users',
  'i-tabler:presentation',
  'i-tabler:presentation-analytics',
  'i-tabler:file-upload',
];

const classStateNames = [
  '班级创建',
  '选择小组',
  '开题报告',
  '结题报告',
  '提交论文',
];
</script>
