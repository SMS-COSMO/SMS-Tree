<template>
  <span v-once class="break-all text-wrap space-x-1.5">
    <span
      v-for="(author, index) of authors" :key="index"
      :class="`${showLeader && author?.id === leader?.id ? 'font-bold!' : ''}`"
    >
      <template v-if="type === 'text'">
        {{ author?.username }}
      </template>
      <el-link
        v-else-if="type === 'link'"
        :href="`/user/${author?.id}`"
        :class="`${showLeader && author?.id === leader?.id ? 'font-bold!' : ''}`"
      >
        {{ author?.username }}
      </el-link>
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  authors?:
    Partial<TMinimalUser | undefined>[]
    | Partial<TUserProfile>[];
  leader?: Partial<TMinimalUser | TUserProfile>;
  type?: 'text' | 'link';
  showLeader?: boolean;
}>(), {
  type: 'text',
  showLeader: true,
});
</script>
