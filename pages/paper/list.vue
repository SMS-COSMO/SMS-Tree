<template>
  <div class="flex flex-col gap-4 lg:flex-row">
    <div class="hidden lg:flex lg:basis-1/4">
      <el-card class="z-10 w-full">
        <SearchOptions v-model="searchOptions" />
        <div class="mt-3 text-sm text-zinc/80">
          共 {{ processedListData.length }} 条结果
        </div>
      </el-card>
    </div>
    <div class="basis-3/4">
      <el-input
        v-model="searchInput"
        placeholder="搜索论文"
        clearable
        class="list-search mb-2.5"
        @change="router.replace({ query: { search: searchInput } });"
      >
        <template #prepend>
          <el-icon class="i-tabler:search hidden! lg:block!" />
          <el-button class="lg:hidden!" @click="showSearchOptions = !showSearchOptions">
            <el-icon class="i-tabler:chevron-down transition-all" :class="[showSearchOptions && 'rotate-180']" />
          </el-button>
        </template>
      </el-input>
      <Transition name="mobile-search-option-transition">
        <el-card v-show="showSearchOptions" class="mb-2.5 lg:hidden">
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
            class="infinite-list fixed left-0 m-0 h-[calc(100svh-95px-45px)] w-screen list-none overflow-x-hidden overflow-y-scroll p-0 scrollbar-hidden md:h-[calc(100svh-95px-55px)]"
          >
            <li v-for="(paper, index) in processedListData.slice(0, count)" :key="index">
              <div class="mx-auto max-w-[1300px] px-4 lg:px-5">
                <div class="flex flex-col lg:flex-row lg:gap-4">
                  <div class="lg:basis-1/4" />
                  <div class="mb-2 lg:basis-3/4">
                    <PaperCard :paper="paper" :bookmarked="bookmarks?.includes(paper.id)" />
                  </div>
                </div>
              </div>
            </li>
            <li v-if="processedListData.length === 0" class="text-center">
              <div class="mx-auto max-w-[1300px] px-4 lg:px-5">
                <div class="flex flex-col lg:flex-row lg:gap-4">
                  <div class="lg:basis-1/4" />
                  <div class="mb-2 lg:basis-3/4">
                    <el-empty description="无结果，换个搜索条件试试？" />
                  </div>
                </div>
              </div>
            </li>
          </TransitionGroup>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
useHeadSafe({
  title: '论文列表',
});
const { $api } = useNuxtApp();

const route = useRoute();
const router = useRouter();
const count = ref(10);

const searchInput = ref(route.query.search?.toString() ?? '');
const searchContent = refDebounced(searchInput, 200);
const showSearchOptions = ref(false);

const searchOptions = reactive<TSearchOption>({
  filter: {
    onlyCanDownload: false,
    onlyFeatured: false,
    onlyBookmarked: false,
    category: [],
    restrictEnterYear: false,
    enterYear: new Date().getFullYear(),
  },
  isAsc: 1,
  searchSelectValue: ['title', 'keywords'],
  sortOption: searchInput.value ? 'default' : 'featured',
});
receiveQuery();

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

watch(searchInput, () => {
  if (searchInput.value.length)
    searchOptions.sortOption = 'default';
  else
    searchOptions.sortOption = 'featured';
});

const { data: bookmarks, suspense: bookmarksSuspense } = useQuery({
  queryKey: ['paper.bookmarks'],
  queryFn: () => $api.paper.bookmarks.query(),
});
await bookmarksSuspense();

const { processedListData } = await useSearch<TPaperListSafeItem>(
  searchContent,
  fuseOptions,
  $api.paper.list.query,
  ['paper.list'],
  e => e.item,
  (o: TPaperListSafeItem) => {
    if (searchOptions.filter.onlyCanDownload && !o.canDownload)
      return false;
    if (searchOptions.filter.onlyFeatured && !o.isFeatured)
      return false;
    if (searchOptions.filter.onlyBookmarked && !bookmarks.value?.includes(o.id))
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
    if (searchOptions.sortOption === 'featured') {
      if (a.isFeatured && b.isFeatured)
        return a.createdAt > b.createdAt ? -1 : 1; // Newest
      if (a.isFeatured)
        return -1;
      return 1;
    }
    if (searchOptions.sortOption === 'time')
      return (a.createdAt > b.createdAt ? -1 : 1) * searchOptions.isAsc; // Newest
    return 0;
  },
);

function load() {
  count.value += Math.min(15, processedListData.value.length - count.value);
}

function receiveQuery() {
  const categoryInput = route.query.category?.toString() ?? '';
  if (!categoryInput.length)
    return;
  const categoryId = Number(categoryInput);
  if (!getCategory(categoryId))
    return;
  searchOptions.filter.category.push(Number(categoryInput));
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
