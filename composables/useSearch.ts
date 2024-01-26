import type { UseFuseOptions } from '@vueuse/integrations/useFuse';
import { useFuse } from '@vueuse/integrations/useFuse';
import type { TUserListItem } from '~/types/index';

export function useSearch<T>(
  searchContent: Ref<string>,
  fuseOptions: MaybeRefOrGetter<UseFuseOptions<T>>,
  getList: Function,
  map: (e: any) => T = (e: any) => e.item,
  filter?: (e: T) => boolean,
  sort?: ((a: T, b: T) => number),
) {
  const loading = ref(true);
  const listData = ref<T[]>([]);
  const fuse = useFuse(searchContent, listData, fuseOptions);
  const processedListData = computed<T[]>(
    () => fuse.results.value
      .map(map)
      .filter(filter ?? (() => true))
      .sort(sort ?? (() => 0)),
  );

  onMounted(async () => {
    try {
      listData.value = await getList();
      loading.value = false;
    } catch (err) {
      useErrorHandler(err);
      loading.value = false;
    }
  });

  return { processedListData, loading, listData };
}

export function useUserSearch(searchContent: Ref<string>, role: 'student' | 'teacher' = 'student') {
  const { $api } = useNuxtApp();

  return useSearch<TUserListItem>(
    searchContent,
    templateSearchOption(['id', 'username']),
    () => $api.user.list.query({ role }),
  );
}

export function useUserDetailedSearch(searchContent: Ref<string>, role: 'student' | 'teacher' = 'student') {
  const { $api } = useNuxtApp();

  return useSearch<TUserListItem>(
    searchContent,
    templateSearchOption(['id', 'username', 'projectName']),
    async () => {
      const list = await $api.user.list.query({ role });

      const res = [];
      for (const user of list)
        res.push(useUserProjectName(user));
      return await Promise.all(res);
    },
  );
}

export function templateSearchOption(keys: string[]) {
  return {
    fuseOptions: {
      keys,
      shouldSort: true,
    },
    matchAllWhenSearchEmpty: true,
  };
}
