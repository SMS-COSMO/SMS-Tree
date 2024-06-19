<template>
  <client-only>
    <el-steps
      :active="classStateSteps.indexOf(classInfo?.state ?? '')"
      finish-status="wait"
      :direction="direction"
    >
      <el-step
        v-for="s in [0, 1, 2, 3, 4]"
        :key="s"
        :icon="classStateIcons[s]"
        :title="classStateNames[s]"
        :class="[s === 4 && 'is-flex']"
      >
        <template #title>
          <span class="text-xs md:text-size-base">
            {{ classStateNames[s] }}
          </span>
        </template>
        <template v-if="classInfo?.stateTimetable[s]" #description>
          <span class="text-xs md:text-sm">
            {{ new Date(classInfo.stateTimetable[s]).toLocaleDateString('zh-CN') }}
          </span>
        </template>
      </el-step>
    </el-steps>
    <template #fallback>
      <el-steps :direction="direction">
        <el-step
          v-for="s in [0, 1, 2, 3, 4]"
          :key="s"
          :icon="classStateIcons[s]"
          :title="classStateNames[s]"
          :class="`${s === 4 ? 'is-flex' : ''} basis-1/4`"
        >
          <template #title>
            <span class="text-xs md:text-size-base">
              {{ classStateNames[s] }}
            </span>
          </template>
          <template v-if="classInfo?.stateTimetable[s]" #description>
            <span class="text-xs md:text-sm">
              {{ new Date(classInfo.stateTimetable[s]).toLocaleDateString('zh-CN') }}
            </span>
          </template>
        </el-step>
      </el-steps>
    </template>
  </client-only>
</template>

<script setup lang="ts">
defineProps<{
  direction: 'vertical' | 'horizontal';
  classInfo: TClass;
}>();

const classStateIcons = [
  'i-tabler-clock',
  'i-tabler:users',
  'i-tabler:presentation',
  'i-tabler:presentation-analytics',
  'i-tabler:file-upload',
];

const classStateNames = [
  '等待分组',
  '选择小组',
  '开题报告',
  '结题报告',
  '提交论文',
];
</script>
