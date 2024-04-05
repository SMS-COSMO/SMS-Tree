<template>
  <el-card class="mb-5 w-full">
    <el-form
      class="mx-auto w-[700px] py-5"
      :label-position="device.isMobileOrTablet ? 'top' : 'right'"
      :model="form"
      label-width="120px"
    >
      <el-form-item prop="enterYear" label="入学年份">
        <el-input-number v-model="form.enterYear" :min="2000" :max="3000" />
      </el-form-item>
      <el-form-item prop="index" label="班级">
        <el-input-number v-model="form.index" :min="1" :max="100" />
      </el-form-item>
      <el-form-item prop="state" label="状态">
        <StateSelect v-model="form.state" />
      </el-form-item>
      <el-form-item prop="index" label="学生">
        <SelectUser v-model="form.students" />
      </el-form-item>
      <el-form-item prop="index" label="教师">
        <SelectUser v-model="form.teacher" role="teacher" :multiple="false" />
      </el-form-item>
      <el-form-item>
        <el-button color="#146E3C" :loading="buttonLoading" @click="create">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { TClassCreate } from '~/types';

const { $api } = useNuxtApp();
const device = useDevice();
useHeadSafe({
  title: '创建班级',
});

const form = reactive<TClassCreate>({
  index: 1,
  enterYear: (new Date()).getFullYear(),
  state: 'initialized',
  students: [],
  teacher: '',
});

const buttonLoading = ref(false);
async function create() {
  buttonLoading.value = true;
  try {
    const msg = await $api.class.create.mutate({ ...form });
    useElMessage({ message: msg, type: 'success' });
  } catch (err) {
    useErrorHandler(err);
  }
  buttonLoading.value = false;
}
</script>
