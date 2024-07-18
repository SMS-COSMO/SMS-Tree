<template>
  <el-card class="h-content">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4 text-center md:flex-row">
        <el-card class="basis-1/4 card-button" @click="navigateTo('/admin/scoring')">
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
          class="full-card-height relative basis-1/4"
        >
          <div class="mx-auto flex flex-col self-center">
            <div>
              <el-icon class="i-tabler:check" />
              已登录希悦
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
          class="full-card-height basis-1/4 card-button"
          @click="navigateTo('/admin/seiue/login')"
        >
          <div class="mx-auto flex self-center text-2xl">
            <NuxtImg src="/seiue.svg" class="mr-1 w-7" />
            登录希悦
          </div>
        </el-card>
      </div>
      <div class="flex flex-col gap-4 lg:flex-row">
        <el-card class="lg:basis-3/5">
          <el-table
            :data="classList"
            class="cursor-pointer"
            :default-sort="{ prop: 'className', order: 'ascending' }"
            @row-click="(row) => navigateTo(`/admin/class/${row.id}`)"
          >
            <el-table-column
              prop="className"
              label="班级"
              sortable
              show-overflow-tooltip
              :min-width="200"
            />
            <el-table-column :width="200" prop="enterYear" label="入学年份" />
            <el-table-column :width="200" show-overflow-tooltip label="状态">
              <template #default="scope">
                <StateBadge
                  :state="classStateTable.find(s => s.value === scope.row.state) ?? { label: '未知', type: 'info', value: '' }"
                  size="large"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card class="lg:basis-2/5">
          placeholder
        </el-card>
      </div>
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
const { data: seiueMe } = useQuery({
  queryKey: ['seiue.me'],
  queryFn: () => $api.seiue.me.query(), // TODO: refresh token
  enabled,
});

const { data: statistic, suspense: statisticSuspense } = useQuery({
  queryKey: ['statistics.admin'],
  queryFn: () => $api.statistics.admin.query(),
});
await statisticSuspense();

const userStore = useUserStore();
const { data: classList, suspense: classListSuspense } = useQuery({
  queryKey: ['class.list', userStore.userId],
  queryFn: () => $api.class.list.query(userStore.role === 'admin' ? undefined : userStore.userId),
});
await classListSuspense();
</script>

<style>
.el-statistic {
  --el-statistic-content-font-size: 1.875rem !important;
  --el-font-size-extra-small: 0.9rem !important;
}

.full-card-height>.el-card__body {
  height: 100% !important;
  display: flex;
  box-sizing: border-box
}
</style>
