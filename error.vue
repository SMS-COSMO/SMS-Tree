<template>
  <el-card class="card mx-auto">
    <h1 style="font-size: 80px; text-align: center; margin: 20px;">{{ error?.statusCode }}</h1>
    <h1 style="font-size: 30px; text-align: center;">Page Not Found</h1>
  </el-card>
</template>

<script setup lang="ts">
defineProps({
  error: Object
});
</script>


<style scoped lang="scss">
.card {
  max-width: 800px;
  margin-top: 30vh;
}
</style>