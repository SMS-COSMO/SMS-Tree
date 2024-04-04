<template>
  <client-only>
    <el-select
      v-model="model"
      placeholder="Select"
      size="large"
      class="lg:w-60!"
    >
      <el-option
        v-for="item in stateTable"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
        <StateBadge :state="item" size="default" />
      </el-option>
    </el-select>
    <template #fallback>
      <SelectPlaceholder width="240" />
    </template>
  </client-only>
</template>

<script setup lang="ts">
import { stateTable } from '~/constants/class';
import type { TClassState } from '~/types';

const model = defineModel<TClassState>({ required: true });
</script>
