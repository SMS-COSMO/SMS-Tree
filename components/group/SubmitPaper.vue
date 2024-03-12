<template>
  <el-row :gutter="20">
    <el-col :span="22">
      <el-space direction="vertical" class="w-full" :size="20" fill>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <el-descriptions :column="2" :border="true">
                <el-descriptions-item label="班级" />
                <el-descriptions-item label="" />
                <el-descriptions-item label="小组成员" :span="2" />
              </el-descriptions>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card>
              <template #header>
                Stats
              </template>
            </el-card>
          </el-col>
        </el-row>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="上传" name="first">
            <el-upload drag multiple>
              <el-icon class="el-icon--upload">
                <ElIconUploadFilled />
              </el-icon>
              <div class="el-upload__text">
                拖拽文件或 <em>点击这里上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  Place Holder
                </div>
              </template>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="已上传文件" name="second">
            <client-only>
              <el-collapse>
                <el-collapse-item title="Placeholder">
                  placeholder
                </el-collapse-item>
              </el-collapse>
            </client-only>
          </el-tab-pane>
        </el-tabs>

        <el-card>
          laos
        </el-card>
      </el-space>
    </el-col>

    <el-col :span="2">
      <div class="h-[500px]">
        <client-only>
          <el-steps direction="vertical" :active="1">
            <el-step :icon="ElIconUpload" title="提交" />
            <el-step :icon="ElIconCircleCheck" title="查重" />
            <el-step :icon="ElIconEdit" title="批改" />
          </el-steps>
        </client-only>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
const activeTab = ref('first');
</script>
