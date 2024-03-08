<template>
  <div class="absolute inset-x-0 box-border w-screen flex flex-row gap-4 px-4">
    <AdminNavBar />
    <el-card class="mb-5 w-full">
      <slot />
    </el-card>
  </div>
</template>
