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
            @change="emit('update:modelValue', l)"
          />
        </template>
      </el-step>
    </el-steps>
  </client-only>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue']);
const l = ref([...Array(5)].map(_ => undefined));
</script>
