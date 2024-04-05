import { defineStore } from 'pinia';
import type { TPaperListSafe } from '~/types';

export const usePaperList = defineStore('paper_list', () => {
  const list = ref<TPaperListSafe>([]);
  const lastUpdate = ref(0);

  const getList = async () => {
    const { $api } = useNuxtApp();
    const now = Date.now();
    if (
      ['admin', 'teacher'].includes(useUserStore().role)
      || !list.value.length
      || now - lastUpdate.value > 10 * 60 * 1000 // 10min
    ) {
      list.value = await $api.paper.listSafe.query();
      lastUpdate.value = now;
    }

    return list.value.map((x) => {
      if (typeof x.createdAt === 'string')
        x.createdAt = new Date(x.createdAt);
      return x;
    });
  };

  const clear = () => {
    list.value = [];
    lastUpdate.value = 0;
  };

  return {
    list,
    lastUpdate,
    getList,
    clear,
  };
}, {
  persist: {
    storage: persistedState.localStorage,
  },
});
