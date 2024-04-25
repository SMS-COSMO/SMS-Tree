<template>
  <el-row :gutter="20">
    <el-col v-if="!device.isMobileOrTablet" :span="device.isMobileOrTablet ? 24 : 6">
      <el-card class="relative z-10">
        <SearchOptions v-model="searchOptions" />
      </el-card>
    </el-col>
    <el-col v-on-click-outside="closeSearchOptions" :span="device.isMobileOrTablet ? 24 : 18">
      <el-input
        v-model="searchInput" placeholder="搜索论文" clearable class="list-search mb-2.5" :suffix-icon="device.isMobileOrTablet ? 'i-tabler:search' : ''"
        @change="$router.replace({ query: { search: searchInput } });"
      >
        <template #prepend>
          <el-icon v-if="!device.isMobileOrTablet" class="i-tabler:search" />
          <el-button v-else @click="showSearchOptions = !showSearchOptions">
            <el-icon v-if="!showSearchOptions" class="i-tabler:chevron-down" />
            <el-icon v-else class="i-tabler:chevron-up" />
          </el-button>
        </template>
      </el-input>
      <Transition name="mobile-search-option-transition">
        <el-card v-show="showSearchOptions" class="mb-2.5">
          <SearchOptions v-model="searchOptions" />
        </el-card>
      </Transition>
      <Transition name="mobile-search-result-transition">
        <div v-show="!showSearchOptions">
          <TransitionGroup
            v-infinite-scroll="load"
            infinite-scroll-immediate="false"
            infinite-scroll-distance="500"
            name="list" tag="ul"
            class="infinite-list fixed left-0 m-0 h-[calc(100svh-95px-65px)] w-screen list-none overflow-x-hidden overflow-y-scroll p-0 scrollbar-hidden"
          >
            <li v-for="(paper, index) in processedListData.slice(0, count)" :key="index">
              <div class="mx-auto max-w-[1300px] px-4 lg:px-5">
                <el-row :gutter="20">
                  <el-col :span="6" />
                  <el-col :span="device.isMobileOrTablet ? 24 : 18">
                    <PaperCard :paper="paper" />
                  </el-col>
                </el-row>
              </div>
            </li>
            <li v-if="processedListData.length === 0" class="text-center">
              <div class="mx-auto max-w-[1300px] px-4 lg:px-5">
                <el-row :gutter="20">
                  <el-col :span="6" />
                  <el-col :span="device.isMobileOrTablet ? 24 : 18">
                    <el-empty description="无结果，换个搜索条件试试？" />
                  </el-col>
                </el-row>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </Transition>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';

useHeadSafe({
  title: '论文列表',
});
const { $api } = useNuxtApp();

const route = useRoute();
const device = useDevice();

const count = ref(10);

const searchInput = ref(route.query.search?.toString() ?? '');
const searchContent = refDebounced(searchInput, 200);
const showSearchOptions = ref(false);
function closeSearchOptions() {
  showSearchOptions.value = false;
}

const searchOptions = reactive<TSearchOption>({
  filter: {
    onlyCanDownload: false,
    onlyFeatured: false,
    category: [],
    restrictEnterYear: false,
    enterYear: new Date().getFullYear(),
  },
  isAsc: 1,
  searchSelectValue: ['title', 'keywords'],
  sortOption: searchContent.value.length ? 'default' : 'time',
});

const fuseOptions = computed(() => {
  return {
    fuseOptions: {
      keys: searchOptions.searchSelectValue,
      shouldSort: true,
      threshold: 0.6,
      useExtendedSearch: true,
    },
    matchAllWhenSearchEmpty: true,
  };
});

watch(searchContent, () => {
  if (searchContent.value.length)
    searchOptions.sortOption = 'default';
  else
    searchOptions.sortOption = 'time';
});

const { processedListData } = await useSearch<TPaperListSafeItem>(
  searchContent,
  fuseOptions,
  $api.paper.list.query,
  ['paperSearch'],
  e => e.item,
  (o: TPaperListSafeItem) => {
    if (searchOptions.filter.onlyCanDownload && !o.canDownload)
      return false;
    if (searchOptions.filter.onlyFeatured && !o.isFeatured)
      return false;
    if (searchOptions.filter.restrictEnterYear && o.enterYear !== searchOptions.filter.enterYear)
      return false;
    if (searchOptions.filter.category.length && !searchOptions.filter.category.includes(o.category))
      return false;
    return true;
  },
  (a: TPaperListSafeItem, b: TPaperListSafeItem) => {
    if (searchOptions.sortOption === 'default')
      return 0;
    if (searchOptions.sortOption === 'score')
      return ((a.score?.charCodeAt(0) ?? 68) - (b.score?.charCodeAt(0) ?? 68)) * searchOptions.isAsc; // Greater
    if (searchOptions.sortOption === 'time')
      return (a.createdAt > b.createdAt ? -1 : 1) * searchOptions.isAsc; // Newest
    if (searchOptions.sortOption === 'downloadCount')
      return (b.downloadCount - a.downloadCount) * searchOptions.isAsc; // Greater
    return 0;
  },
);

function load() {
  count.value += Math.min(15, processedListData.value.length - count.value);
}
</script>

<style scoped>
.list-search {
  height: 45px !important;
}

.infinite-list::-webkit-scrollbar {
  display: none;
}

.list-enter-active {
  transition: all 0.5s ease;
}

.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.mobile-search-option-transition-enter-active {
  transition: all 0.3s ease;
}

.mobile-search-option-transition-leave-active {
  transition: all 0.15s ease;
}

.mobile-search-option-transition-enter-from,
.mobile-search-option-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.mobile-search-result-transition-enter-active {
  transition: all 0.5s cubic-bezier(.68, -0.56, .29, .9);
}

.mobile-search-result-transition-enter-from,
.mobile-search-result-transition-leave-to {
  opacity: 0;
}
</style>
