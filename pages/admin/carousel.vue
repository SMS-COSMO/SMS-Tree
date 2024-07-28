<template>
  <el-card class="min-h-admin-content">
    <div class="mx-auto max-w-[1300px]">
      <el-carousel trigger="click" height="250px" :interval="10000" class="mb-8">
        <el-carousel-item v-for="item in carousel" :key="item.id">
          <el-image class="h-full w-full" :src="item.fileUrl" fit="cover" />
        </el-carousel-item>
      </el-carousel>
      <div class="flex flex-wrap justify-center gap-4">
        <el-card v-for="item in carousel" :key="item.id">
          <div class="flex flex-col gap-2">
            <el-image
              class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
              :src="item.fileUrl"
              :preview-src-list="[item.fileUrl]"
              fit="cover"
            />
            <el-popconfirm
              title="确定要删除吗？"
              width="200"
              confirm-button-type="danger"
              hide-icon
              @confirm="remove(item.id)"
            >
              <template #reference>
                <i class="i-tabler:trash?mask mx-auto cursor-pointer text-red" />
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>
      <UploadFile v-model="fileList" v-model:uploading="uploading" category="carousel" class="my-8" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp();
const queryClient = useQueryClient();
const { data: carousel } = useQuery({
  queryKey: ['attachment.carousel'],
  queryFn: () => $api.attachment.carousel.query(),
});

const fileList = ref<string[]>([]);
const uploading = ref(false);
watch(uploading, (v) => {
  if (!v) {
    queryClient.invalidateQueries({ queryKey: ['attachment.carousel'] });
    fileList.value = [];
  }
});

async function remove(id: string) {
  try {
    await $api.attachment.remove.mutate({ id });
    queryClient.invalidateQueries({ queryKey: ['attachment.carousel'] });
  } catch (err) {
    useErrorHandler(err);
  }
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 250px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
