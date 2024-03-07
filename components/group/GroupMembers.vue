<template>
  <span v-if="type === 'text'" class="space-x-1.5">
    <template v-if="groupId">
      <span
        v-for="(member, index) of members" :key="index"
        :class="`${showLeader && member.id === leader ? 'font-bold' : ''}`"
      >
        {{ member.username }}
      </span>
    </template>
    <template v-else-if="authors">
      <span
        v-for="(author, index) of authors" :key="index"
        :class="`${showLeader && author.id === leaderId ? 'font-bold' : ''}`"
      >
        {{ author.username }}
      </span>
    </template>
  </span>
  <span v-else-if="type === 'link'" class="space-x-1.5">
    <template v-if="groupId">
      <span v-for="(member, index) of members" :key="index">
        <el-link
          :href="`/user/${member.id}`"
          :class="`${showLeader && member.id === leader ? 'font-bold' : ''}`"
        >
          {{ member.username }}
        </el-link>
      </span>
    </template>
    <template v-else-if="authors">
      <span v-for="(author, index) of authors" :key="index">
        <el-link
          :href="`/user/${author.id}`"
          :class="`${showLeader && author.id === leaderId ? 'font-bold' : ''}`"
        >
          {{ author.username }}
        </el-link>
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computedAsync } from '@vueuse/core';
import type { TAuthor } from '~/server/trpc/serializer/paper';

const props = withDefaults(defineProps<{
  groupId?: string;
  authors?: TAuthor[];
  leaderId?: string;
  type?: 'text' | 'link';
  showLeader?: boolean;
}>(), {
  type: 'text',
  showLeader: true,
});

const { $api } = useNuxtApp();

const leader = ref('');
const members = computedAsync(
  async () => {
    if (!props.groupId || props.authors)
      return [];

    const group = await $api.group.content.query({ id: props.groupId });
    leader.value = group.leader ?? '';
    const res = await Promise.all(
      group.members
        .map(async (user) => {
          return { username: (await $api.user.profile.query({ id: user })).username, id: user };
        }),
    );
    return res;
  },
  [],
);
</script>
