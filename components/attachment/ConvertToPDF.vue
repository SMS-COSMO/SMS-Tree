<template>
  <el-icon class="i-tabler:help cursor-pointer" @click="dialogVisible = true" />

  <el-dialog
    v-model="dialogVisible"
    title="文档转换为 PDF 帮助"
    width="800"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="Word 文档" name="docx">
        <h2>WPS</h2>
        <el-steps direction="vertical" :active="-1">
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-to-pdf1.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-to-pdf2.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-to-pdf3.png" class="max-w-full" />
            </template>
          </el-step>
        </el-steps>
      </el-tab-pane>
      <el-tab-pane label="PPT" name="ppt">
        <h2>PowerPoint</h2>
        <el-steps direction="vertical" :active="-1">
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/ppt-to-pdf1.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/ppt-to-pdf2.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/ppt-to-pdf3.png" class="max-w-full" />
            </template>
          </el-step>
        </el-steps>
        <h2>WPS</h2>
        <el-steps direction="vertical" :active="-1">
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-ppt-to-pdf1.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-ppt-to-pdf2.png" class="max-w-full" />
            </template>
          </el-step>
          <el-step>
            <template #description>
              <NuxtImg src="/convertToPDF/wps-ppt-to-pdf3.png" class="max-w-full" />
            </template>
          </el-step>
        </el-steps>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="dialogVisible = false">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
const dialogVisible = ref(false);
const activeName = ref('docx');
</script>
