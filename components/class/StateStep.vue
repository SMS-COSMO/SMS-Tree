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
        :class="s === 4 ? 'is-flex' : ''"
      >
        <template v-if="classInfo?.stateTimeTable[s]" #description>
          <span class="text-sm">
            {{ new Date(classInfo.stateTimeTable[s]).toLocaleDateString('zh-CN') }}
          </span>
        </template>
      </el-step>
    </el-steps>
    <template #fallback>
      <!-- hack basis value -->
      <el-steps :direction="direction">
        <el-step
          v-for="s in [0, 1, 2, 3, 4]"
          :key="s"
          :icon="classStateIcons[s]"
          :title="classStateNames[s]"
          :class="`${s === 4 ? 'is-flex' : ''} basis-1/4`"
        >
          <template v-if="classInfo?.stateTimeTable[s]" #description>
            <span class="text-sm">
              {{ new Date(classInfo.stateTimeTable[s]).toLocaleDateString('zh-CN') }}
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
</script>
