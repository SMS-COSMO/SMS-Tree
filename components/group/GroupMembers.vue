<template>
  <span class="break-all text-wrap space-x-1.5">
    <span
      v-for="(author, index) of authors" :key="index"
      :class="`${showLeader && author?.id === leader?.id ? 'font-bold!' : ''}`"
    >
      <template v-if="type === 'text'">
        {{ author?.username }}
      </template>
      <el-link
        v-else
        :href="`${isAdmin ? '/admin' : ''}/user/${author?.id}`"
        :class="`${showLeader && author?.id === leader?.id ? 'font-bold!' : ''}`"
      >
        <el-popover placement="top" :width="300" trigger="hover" :show-after="600">
          <template #reference>
            {{ author?.username }}
          </template>
          <el-descriptions title="组员信息" :column="1" border>
            <el-descriptions-item label="ID">
              <el-tag type="info" disable-transitions>
                {{ author?.id }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="姓名">
              {{ author?.username }}
            </el-descriptions-item>
          </el-descriptions>
        </el-popover>
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
  isAdmin?: boolean;
}>(), {
  type: 'text',
  showLeader: true,
  isAdmin: false,
});
</script>
