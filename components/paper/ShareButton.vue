<template>
  <el-tooltip
    content="分享"
    placement="top"
  >
    <div class="cursor-pointer" @click="showDialog = true">
      <el-icon class="i-tabler:share" />
    </div>
  </el-tooltip>

  <client-only>
    <el-dialog
      v-model="showDialog"
      width="500"
      align-center
    >
      <template #header>
        分享论文
      </template>

      <div class="mb-2 font-bold">
        链接
      </div>
      <el-input :model-value="url">
        <template v-if="isSupported" #append>
          <el-button @click="copy()">
            <span v-if="!copied">
              复制
            </span>
            <span v-else>
              复制成功
            </span>
          </el-button>
        </template>
      </el-input>
      <div class="mb-2 mt-4 font-bold">
        二维码：
      </div>
      <img :src="qrcode" alt="QR Code" class="mx-auto">
    </el-dialog>
  </client-only>
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode';

const showDialog = ref(false);

const url = ref();
onMounted(() => url.value = window.location.href);
const { copy, copied, isSupported } = useClipboard({ source: url });
const qrcode = useQRCode(url);
</script>
