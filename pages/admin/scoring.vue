<template>
  <el-row :gutter="16">
    <el-col :span="6">
      <el-card class="flow h-content">
        <template #header>
          :Filters Here:
        </template>
        <el-scrollbar>
          <template v-for="item in list" :key="item">
            <TeacherPaperCard :paper="item" @selected="id => selected = id" />
          </template>
        </el-scrollbar>
      </el-card>
    </el-col>
    <el-col :span="18">
      <el-card class="h-content">
        <el-scrollbar>
          <transition name="content" mode="out-in">
            <TeacherPaperContent :id="selected" :key="selected" />
          </transition>
        </el-scrollbar>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();

// This is placeholder, TODO: select none scored papers
const list = await $api.paper.listSafe.query();
// ----

const selected = ref(list[0].id);
</script>

<style>
.flow>.el-card__body {
  box-sizing: border-box;
  padding: 15px;
}

.h-content>.el-card__body {
  height: 100%;
}

.content-enter-active,
.content-leave-active {
  transition: opacity 0.1s ease;
}

.content-enter-from,
.content-leave-to {
  opacity: 0;
}
</style>
