<template>
  <span class="flex gap-1.2 break-all text-wrap md:gap-1.5">
    <span
      v-for="(author, index) of authors" :key="index"
      class="text-xs md:text-sm"
      :class="[showLeader && author?.id === leader?.id && 'font-bold!']"
    >
      <template v-if="type === 'text'">
        {{ author?.username }}
      </template>
      <el-link
        v-else
        :href="`${isAdmin ? '/admin' : ''}/user/${author?.id}`"
        :class="`${showLeader && author?.id === leader?.id ? 'font-bold!' : ''}`"
      >
        {{ author?.username }}
      </el-link>
    </span>
  </span>
</template>

<script setup lang="ts">
const {
  type = 'text',
  showLeader = true,
  isAdmin = false,
} = defineProps<{
  authors?:
    Partial<TMinimalUser | undefined>[]
    | Partial<TUserProfile>[];
  leader?: Partial<TMinimalUser | TUserProfile>;
  type?: 'text' | 'link';
  showLeader?: boolean;
  isAdmin?: boolean;
}>();
</script>
