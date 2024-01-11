import { useFuse } from '@vueuse/integrations/useFuse';
import type { TUserStudentListOutput } from '~/types/index';

export function useSearchStudent(searchContent: Ref<string>) {
  const { $api } = useNuxtApp();

  function fuseOptions() {
    return {
      fuseOptions: {
        keys: ['id', 'username'],
        shouldSort: true,
      },
      matchAllWhenSearchEmpty: true,
    };
  }

  const loading = ref(true);
  const listData = ref<TUserStudentListOutput>([]);
  const fuse = useFuse(searchContent, listData, fuseOptions);
  const processedListData = computed<TUserStudentListOutput>(() =>
    fuse.results.value.map(e => e.item),
  );

  onMounted(async () => {
    try {
      listData.value = await $api.user.studentList.query();
      loading.value = false;
    } catch (err) {
      useErrorHandler(err);
    }
  });

  return { processedListData, loading, listData };
}
