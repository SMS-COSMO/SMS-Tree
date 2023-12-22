<template>
  <div style="width: 100%;">
    <el-tag
      v-for="tag in modelValue" :key="tag" size="large" effect="plain" class="mx-1" closable type="info"
      :disable-transitions="false" @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>

    <ElInput
      v-if="inputVisible" ref="InputRef" v-model="inputValue" :maxlength="contentMaxLength" show-word-limit
      class="same-size tag-input mx-1" size="small" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm"
    />
    <el-tooltip v-else :visible="tooltipVisible" placement="top-start" content="最多添加 8 个关键词">
      <el-button
        class="same-size mx-1" size="small" color="#146E3C" plain :disabled="modelValue.length >= 8"
        @click="showInput" @mouseenter="tooltipVisible = modelValue.length >= 8"
        @mouseleave="tooltipVisible = false"
      >
        + 添加关键词
      </el-button>
    </el-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus';

const props = withDefaults(defineProps<{
  modelValue: string[]
  contentMaxLength?: number
  maxLength?: number
}>(), {
  contentMaxLength: 8,
  maxLength: 8,
});
const emit = defineEmits(['update:modelValue']);

const inputValue = ref('');
const dynamicTags = ref(props.modelValue);
const inputVisible = ref(false);
const InputRef = ref<InstanceType<typeof ElInput>>();

const tooltipVisible = ref(false);

function handleClose(tag: string) {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
}

function showInput() {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value?.input?.focus();
  });
}

function handleInputConfirm() {
  if (inputValue.value && !dynamicTags.value.includes(inputValue.value))
    dynamicTags.value.push(inputValue.value);

  inputVisible.value = false;
  inputValue.value = '';
  emit('update:modelValue', dynamicTags.value);
}
</script>

<style scoped lang="scss">
.same-size {
  height: 32px !important;
  width: 120px !important;
  border-radius: 4px !important;
}

.tag-input {
  border: 1px solid var(--el-color-info-light-5) !important;
}
</style>

<style lang="scss">
.tag-input .el-input__wrapper {
  border: none !important;
}
</style>
