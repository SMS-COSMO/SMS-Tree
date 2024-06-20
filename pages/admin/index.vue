<template>
  <el-card class="mb-5">
    <div class="flex flex-row gap-4 text-center">
      <el-card class="basis-1/4">
        <el-statistic :value="statistic?.scorePaperCount">
          <template #title>
            <el-icon class="i-tabler:pencil" />
            待批改论文
          </template>
        </el-statistic>
      </el-card>
      <el-card class="basis-1/2">
        <div class="grid grid-cols-3">
          <el-statistic :value="statistic?.publicPaperCount">
            <template #title>
              <el-icon class="i-tabler:file-description" />
              公开论文数
            </template>
          </el-statistic>
          <el-statistic :value="statistic?.studentCount">
            <template #title>
              <el-icon class="i-tabler:users" />
              学生数
            </template>
          </el-statistic>
          <el-statistic :value="statistic?.classCount">
            <template #title>
              <el-icon class="i-tabler:school" />
              班级数
            </template>
          </el-statistic>
        </div>
      </el-card>
      <el-card
        v-if="seiueStore.loggedIn"
        class="card-button relative basis-1/4"
      >
        <div class="mx-auto flex flex-col self-center">
          <div>
            <el-icon class="i-tabler:check" />
            已登陆希悦
          </div>
          <span class="mt-2 text-2xl">
            {{ seiueMe?.name }}
          </span>
          <el-button class="absolute right-3 top-3" size="small" @click="seiueStore.logout">
            <el-icon class="i-tabler:logout mr-1" />
            登出
          </el-button>
        </div>
      </el-card>
      <el-card
        v-else
        class="card-button basis-1/4 cursor-pointer hover:border-color-[#D4D7DE]! hover:bg-hover-bg!"
        @click="navigateTo('/admin/seiue/login')"
      >
        <div class="mx-auto flex self-center text-2xl">
          <NuxtImg src="/seiue.svg" class="mr-1 w-7" />
          登录希悦
        </div>
      </el-card>
    </div>
  </el-card>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '管理',
});

const seiueStore = useSeiueStore();
const { $api } = useNuxtApp();

const enabled = computed(() => seiueStore.loggedIn);
const { data: seiueMe, suspense: seiueSuspense } = useQuery({
  queryKey: ['seiue.me'],
  queryFn: () => $api.seiue.me.query(), // TODO: refresh token
  enabled,
});
await seiueSuspense();

const { data: statistic, suspense } = useQuery({
  queryKey: ['statistics.admin'],
  queryFn: () => $api.statistics.admin.query(),
});
await suspense();
</script>

<style>
.el-statistic {
  --el-statistic-content-font-size: 1.875rem !important;
  --el-font-size-extra-small: 0.9rem !important;
}

.card-button>.el-card__body {
  height: 100% !important;
  display: flex;
  box-sizing: border-box
}
</style>
