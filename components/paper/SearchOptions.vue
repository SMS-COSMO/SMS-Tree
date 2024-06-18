<template>
  <div class="space-y-1.5">
    <el-checkbox v-model="modelValue.filter.onlyCanDownload" label="仅查看可下载" border @change="updateValue" />
    <el-checkbox v-model="modelValue.filter.onlyFeatured" label="仅查看优秀作业" border @change="updateValue" />
  </div>

  <el-divider content-position="left">
    <el-icon class="i-tabler:object-scan" />
    搜索范围
  </el-divider>
  <client-only>
    <div class="space-y-2">
      <el-select v-model="modelValue.searchSelectValue" placeholder="搜索内容" multiple class="w-full" @change="updateValue">
        <el-option v-for="item in searchSelectOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <CategorySelectMultiple v-model="modelValue.filter.category" />
      <div>
        <el-checkbox v-model="modelValue.filter.restrictEnterYear" label="按届筛选" />
      </div>
      <el-collapse-transition>
        <div v-show="modelValue.filter.restrictEnterYear">
          <el-input-number v-model="modelValue.filter.enterYear" />
        </div>
      </el-collapse-transition>
    </div>
    <template #fallback>
      <div class="space-y-2">
        <select-placeholder />
        <select-placeholder />
        <select-placeholder />
      </div>
    </template>
  </client-only>

  <el-collapse-transition>
    <div v-if="modelValue.sortOption !== 'default'">
      <el-divider content-position="left">
        <el-icon class="i-tabler:filter" />
        排序依据
      </el-divider>
      <el-radio-group v-model="modelValue.sortOption">
        <el-radio-button value="time">
          <el-icon class="i-tabler:calendar-time" />
          时间
        </el-radio-button>
        <el-radio-button value="score">
          <el-icon class="i-tabler:chart-bar" />
          分数
        </el-radio-button>
      </el-radio-group>
      <br>
      <el-radio-group v-model="modelValue.isAsc" class="ml-4">
        <el-radio :value="1" size="large">
          顺序
        </el-radio>
        <el-radio :value="-1" size="large">
          逆序
        </el-radio>
      </el-radio-group>
    </div>
  </el-collapse-transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: TSearchOption;
}>();
const emit = defineEmits(['update:modelValue']);

const modelValue = ref(props.modelValue);
function updateValue() {
  emit('update:modelValue', modelValue.value);
}

const searchSelectOptions = [
  {
    value: 'title',
    label: '标题',
  },
  {
    value: 'keywords',
    label: '关键词',
  },
];
</script>
