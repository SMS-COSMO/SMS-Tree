<template>
  <el-card class="mb-2 cursor-pointer lg:mb-2.5 hover:border-color-[#D4D7DE]! hover:bg-hover-bg!">
    <el-row class="gap-[6px]">
      <el-tag type="info" disable-transitions>
        {{ note.time.toLocaleDateString('zh-CN') }}
      </el-tag>
    </el-row>
    <div class="mt-1">
      <el-text class="break-normal font-bold text-xl!">
        {{ note.title }}
      </el-text>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { TRawNote } from '~/server/db/db';

defineProps<{ note: TRawNote }>();
</script>
