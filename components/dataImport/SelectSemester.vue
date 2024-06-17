<template>
  <client-only>
    <div class="h-full space-y-4">
      <el-alert
        title="注意"
        type="warning"
        :closable="false"
      >
        在导入数据前，
        <el-link type="warning" href="/admin/class/delete">
          请删除上一学年的所有班级。
        </el-link>
      </el-alert>
      <div v-loading="isFetching">
        <div v-if="semesters" class="grid grid-cols-1 gap-4">
          <el-select-v2
            v-model="selectedSemesterId"
            :options="semesters"
            placeholder="请选择学期"
            :props="props"
          />
          <el-button
            class="ml-auto"
            :disabled="!selectedSemesterId"
            @click="$emit('next', selectedSemesterId as number)"
          >
            下一步
            <el-icon class="i-tabler:arrow-right" />
          </el-button>
        </div>
        <el-empty v-else description="获取学期列表失败" />
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
defineEmits<{ next: [value: number] }>();
const { $api } = useNuxtApp();
const selectedSemesterId = ref<number>();
const props = {
  value: 'id',
  label: 'name',
};

const { data: semesters, isFetching } = useQuery({
  queryKey: ['seiue.semesters'],
  queryFn: () => $api.seiue.semesters.query(),
});
</script>
