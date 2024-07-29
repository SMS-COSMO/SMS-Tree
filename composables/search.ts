import { type QueryKey, useQuery } from '@tanstack/vue-query';
import type { UseFuseOptions } from '@vueuse/integrations/useFuse';
import { useFuse } from '@vueuse/integrations/useFuse';

export async function useSearch<T>(
  searchContent: Ref<string>,
  fuseOptions: MaybeRefOrGetter<UseFuseOptions<T>>,
  getList: () => Promise<T[]>,
  queryKey: QueryKey,
  map: (e: any) => T = (e: any) => e.item,
  filter?: (e: T) => boolean,
  sort?: ((a: T, b: T) => number),
) {
  const { data: listData, suspense } = useQuery({
    queryKey,
    queryFn: getList,
  });
  await suspense();

  const fuse = listData.value === undefined
    ? useFuse(searchContent, [], fuseOptions)
    : useFuse(searchContent, listData, fuseOptions);
  const processedListData = computed<T[]>(
    () => fuse.results.value
      .map(map)
      .filter(filter ?? (() => true))
      .sort(sort ?? (() => 0)),
  );
  return { processedListData, listData };
}

export function useUserSearch(searchContent: Ref<string>, role: 'student' | 'teacher' = 'student') {
  const { $api } = useNuxtApp();

  return useSearch<TUserListItem>(
    searchContent,
    templateSearchOption(['schoolId', 'username', 'projectName', 'className']),
    () => $api.user.list.query({ role }),
    ['user.list', { role }],
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
