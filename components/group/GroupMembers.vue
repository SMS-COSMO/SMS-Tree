<template>
  <el-skeleton :rows="0" :loading="loading" animated style="width: 600px;">
    <span v-if="type === 'text'">
      <span v-for="(member, index) of members" :key="index" class="mx-0.6"
        :style="`${showLeader && member.userId === leader ? 'font-weight: bold;' : ''}`">
        {{ member.username }}
      </span>
    </span>
    <span v-if="type === 'link'">
      <span v-for="(member, index) of members" :key="index" class="mx-0.6">
        <el-link :href="`/user/${member.userId}`"
          :style="`${showLeader && member.userId === leader ? 'font-weight: bold;' : ''}`">{{ member.username }}</el-link>
      </span>
    </span>
  </el-skeleton>
</template>

<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
const { $api } = useNuxtApp();

const props = withDefaults(defineProps<{
  groupId: string;
  type?: 'text' | 'link';
  showLeader?: boolean;
}>(), {
  type: 'text',
  showLeader: true,
});

const loading = ref(true);
const leader = ref('');

const members = computedAsync(
  async () => {
    const group = await $api.group.content.query({ id: props.groupId });
    leader.value = group.leader ?? '';
    const res = await Promise.all(
      group.members
        .map(async user => {
          return { username: (await $api.user.profile.query({ id: user })).username, userId: user };
        })
    );
    loading.value = false;
    return res;
  },
  [],
);
</script>