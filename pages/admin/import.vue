<template>
  <el-card v-if="seiueStore.loggedIn" class="h-full w-full">
    <el-container class="mx-auto my-4 h-full max-w-5xl">
      <el-header>
        <el-steps
          align-center
          :active="activeStep"
        >
          <el-step title="选择学期" />
          <el-step title="选择班级" />
          <el-step title="导入数据" />
        </el-steps>
      </el-header>
      <el-main class="h-full">
        <SelectSemester v-if="activeStep === 1" @next="(val) => { activeStep += 1; selectedSemesterId = val; }" />
        <SelectClasses
          v-if="activeStep === 2"
          :semester-id="selectedSemesterId!"
          @back="() => activeStep -= 1"
          @next="(val) => {
            activeStep += 1;
            callImportData(val);
          }"
        />
        <ProcessData
          v-if="activeStep === 3"
          :is-finished="isFinished"
          :import-result="importResult!"
          @reset="() => {
            activeStep = 1;
            selectedSemesterId = undefined;
            isFinished = false;
            importResult = undefined;
          }"
        />
      </el-main>
    </el-container>
  </el-card>
  <el-card v-else class="h-content w-full">
    <SeiueLogin :router-back="false" />
  </el-card>
</template>

<script setup lang="ts">
import type { TImportDataResult } from '~/types';

const seiueStore = useSeiueStore();
const activeStep = ref(1);
const selectedSemesterId = ref<number>();
const isFinished = ref(false);
const importResult = ref<TImportDataResult>();

const { $api } = useNuxtApp();
const { mutate: callImportData } = useMutation({
  mutationFn: $api.seiue.importData.mutate,
  onMutate: () => { activeStep.value = 3; },
  onSuccess: (result) => {
    importResult.value = result;
    isFinished.value = true;
  },
  onError: err => useErrorHandler(err),
});
</script>
