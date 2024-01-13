<template>
  <el-card>
    <el-form class="register-form mx-auto py-5" :model="form" label-width="120px">
      <el-form-item prop="enterYear" label="入学年份">
        <el-input-number v-model="form.enterYear" :min="2000" :max="3000" />
      </el-form-item>
      <el-form-item prop="index" label="班级">
        <el-input-number v-model="form.index" :min="1" :max="100" />
      </el-form-item>
      <el-form-item prop="state" label="状态">
        <el-select
          v-model="form.state"
          placeholder="Select"
          size="large"
          style="width: 240px"
        >
          <el-option
            v-for="item in [
              { label: '已归档', value: 'archived' },
              { label: '初始化', value: 'initialized' },
              { label: '选择小组', value: 'selectGroup' },
              { label: '提交论文', value: 'submitPaper' },
            ]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="index" label="学生">
        <SelectUser v-model="form.students" />
      </el-form-item>
      <el-form-item prop="index" label="教师">
        <SelectUser v-model="form.teacher" role="teacher" :multiple="false" />
      </el-form-item>
      <el-form-item>
        <el-button class="submit-button" color="#146E3C" :loading="buttonLoading" @click="create">
          创建
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { TCreateClassInput } from '~/types/index';

const { $api } = useNuxtApp();
useHeadSafe({
  title: '创建论文',
});

const form = reactive<TCreateClassInput>({
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
    await $api.class.create.mutate({
      enterYear: form.enterYear,
      index: form.index,
      state: form.state,
      students: form.students,
      teacher: form.teacher,
    });

    ElMessage({ message: '创建成功', type: 'success', showClose: true });
    buttonLoading.value = false;
  } catch (err) {
    useErrorHandler(err);
    buttonLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
.register-form {
  max-width: 700px;
}
</style>
