<template>
  <div class="space-y-1.5">
    <div>
      <el-checkbox v-model="modelValue.filter.onlyCanDownload" border @change="updateValue">
        <el-icon class="i-tabler:download" />
        可下载
      </el-checkbox>
    </div>
    <div>
      <el-checkbox v-model="modelValue.filter.onlyFeatured" border @change="updateValue">
        <el-icon class="i-tabler:star" />
        优秀
      </el-checkbox>
    </div>
    <div>
      <el-checkbox v-model="modelValue.filter.onlyBookmarked" border @change="updateValue">
        <el-icon class="i-tabler:bookmark" />
        收藏
      </el-checkbox>
    </div>
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
    </div>
    <template #fallback>
      <div class="space-y-2">
        <select-placeholder />
        <select-placeholder />
      </div>
    </template>
  </client-only>
  <div>
    <el-checkbox v-model="modelValue.filter.restrictEnterYear" label="按届筛选" />
  </div>
  <el-collapse-transition>
    <div v-show="modelValue.filter.restrictEnterYear">
      <el-input-number v-model="modelValue.filter.enterYear" />
    </div>
  </el-collapse-transition>

  <el-divider content-position="left">
    <el-icon class="i-tabler:filter" />
    排序依据
  </el-divider>
  <el-radio-group v-model="modelValue.sortOption">
    <el-radio-button value="default">
      <el-icon class="i-tabler:adjustments-horizontal" />
      默认
    </el-radio-button>
    <el-radio-button value="featured">
      <el-icon class="i-tabler:star" />
      优秀
    </el-radio-button>
    <el-radio-button value="time">
      <el-icon class="i-tabler:calendar-time" />
      时间
    </el-radio-button>
  </el-radio-group>
  <el-radio-group v-if="modelValue.sortOption === 'time'" v-model="modelValue.isAsc" class="ml-4">
    <el-radio :value="1" size="large">
      最新
    </el-radio>
    <el-radio :value="-1" size="large">
      最早
    </el-radio>
  </el-radio-group>
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
