<template>
  <el-row :gutter="20">
    <el-col v-if="!isSmallScreen" :span="isSmallScreen ? 24 : 6">
      <el-card>
        <div class="relative z-10">
          <SearchOptions v-model="searchOptions" />
        </div>
      </el-card>
    </el-col>
    <el-col v-on-click-outside="closeSearchOptions" :span="isSmallScreen ? 24 : 18">
      <el-input
        v-model="searchContent" placeholder="搜索论文" clearable class="mb-2.5" :suffix-icon="isSmallScreen ? ElIconSearch : ''"
        @change="$router.replace({ query: { search: searchContent } });"
      >
        <template #prepend>
          <el-icon v-if="!isSmallScreen">
            <ElIconSearch />
          </el-icon>
          <el-button v-else @click="showSearchOptions = !showSearchOptions">
            <el-icon color="#909399">
              <ElIconArrowDownBold v-if="!showSearchOptions" />
              <ElIconArrowUpBold v-else />
            </el-icon>
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
            class="infinite-list fixed left-0 m-0 h-[calc(100svh-95px-65px-70px)] w-screen list-none overflow-x-hidden overflow-y-scroll p-0 scrollbar-hidden lg:h-[calc(100svh-95px-65px)]"
          >
            <li v-for="(paper, index) in processedListData.slice(0, count)" :key="index">
              <div class="mx-auto max-w-[1300px] px-5">
                <el-row :gutter="20">
                  <el-col :span="6" />
                  <el-col :span="isSmallScreen ? 24 : 18">
                    <PaperCard :paper="paper" :show-abstract="searchOptions.showAbstract" />
                  </el-col>
                </el-row>
              </div>
            </li>
            <li v-if="processedListData.length === 0" class="text-center">
              <div class="mx-auto max-w-[1300px] px-5">
                <el-row :gutter="20">
                  <el-col :span="6" />
                  <el-col :span="isSmallScreen ? 24 : 18">
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
import { useSearch } from '~/composables/useSearch';
import type { TPaperListWithAuthorItem } from '~/types/index';
import type { TSearchOption } from '~/components/paper/SearchOptions.vue';

useHeadSafe({
  title: '论文列表',
});

const { $api } = useNuxtApp();
const route = useRoute();
const isSmallScreen = useWindowWidth();

const count = ref(10);

const searchContent = ref(route.query.search?.toString() ?? '');
const showSearchOptions = ref(false);
function closeSearchOptions() {
  showSearchOptions.value = false;
}

const searchOptions = reactive<TSearchOption>({
  filter: {
    onlyCanDownload: false,
    onlyFeatured: false,
    timeRange: '',
  },
  searchSelectValue: ['title', 'keywords'],
  showAbstract: false,
  sortOption: 'default',
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

const { processedListData } = await useSearch<TPaperListWithAuthorItem>(
  searchContent,
  fuseOptions,
  () => $api.paper.listWithAuthor.query(),
  e => e.item,
  (o: TPaperListWithAuthorItem) => {
    if (searchOptions.filter.onlyCanDownload && !o.canDownload)
      return false;
    if (searchOptions.filter.onlyFeatured && !o.isFeatured)
      return false;
    if (searchOptions.filter.timeRange
      && (o.createdAt.getTime() < Date.parse(searchOptions.filter.timeRange[0])
      || o.createdAt.getTime() > Date.parse(searchOptions.filter.timeRange[1]))
    )
      return false;
    return true;
  },
  (a: TPaperListWithAuthorItem, b: TPaperListWithAuthorItem) => {
    if (searchOptions.sortOption === 'default')
      return 0; // Keep original order
    if (searchOptions.sortOption === 'rate')
      return b.rate - a.rate; // Greater first
    if (searchOptions.sortOption === 'time')
      return a.createdAt > b.createdAt ? -1 : 1; // Newest first
    if (searchOptions.sortOption === 'downloadCount')
      return b.downloadCount - a.downloadCount; // Greater first
    return 0;
  },
);

function load() {
  count.value += Math.min(5, processedListData.value.length - count.value);
}
</script>

<style scoped>
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
