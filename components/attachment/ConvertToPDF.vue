<template>
  <el-icon class="i-tabler:help cursor-pointer" @click="dialogVisible = true" />

  <el-dialog
    v-model="dialogVisible"
    title="文档转换为 PDF 帮助"
    width="800"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="Word 文档" name="docx">
        <div class="grid grid-cols-2">
          <div class="pb-20">
            <h2>WPS</h2>
            <el-steps direction="vertical" :active="-1">
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-to-pdf1.png"
                    :preview-src-list="wpsToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-to-pdf2.png"
                    :preview-src-list="wpsToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-to-pdf3.png"
                    :preview-src-list="wpsToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
            </el-steps>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="PPT" name="ppt">
        <div class="grid md:grid-cols-2">
          <div class="pb-20">
            <h2>PowerPoint</h2>
            <el-steps direction="vertical" :active="-1">
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/ppt-to-pdf1.png"
                    :preview-src-list="pptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/ppt-to-pdf2.png"
                    :preview-src-list="pptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/ppt-to-pdf3.png"
                    :preview-src-list="pptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
            </el-steps>
          </div>
          <div class="pb-20">
            <h2>WPS</h2>
            <el-steps direction="vertical" :active="-1">
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-ppt-to-pdf1.png"
                    :preview-src-list="WpsPptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-ppt-to-pdf2.png"
                    :preview-src-list="WpsPptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
              <el-step>
                <template #description>
                  <el-image
                    class="h-40 w-40 shadow transition-all rounded hover:shadow-md"
                    src="/convertToPDF/wps-ppt-to-pdf3.png"
                    :preview-src-list="WpsPptToPDF"
                    fit="cover"
                  />
                </template>
              </el-step>
            </el-steps>
          </div>
        </div>
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

const wpsToPDF = ['/convertToPDF/wps-to-pdf1.png', '/convertToPDF/wps-to-pdf2.png', '/convertToPDF/wps-to-pdf3.png'];
const pptToPDF = ['/convertToPDF/ppt-to-pdf1.png', '/convertToPDF/ppt-to-pdf2.png', '/convertToPDF/ppt-to-pdf3.png'];
const WpsPptToPDF = ['/convertToPDF/wps-ppt-to-pdf1.png', '/convertToPDF/wps-ppt-to-pdf2.png', '/convertToPDF/wps-ppt-to-pdf3.png'];
</script>
