import { defineStore } from 'pinia';
import type { TPaperListSafe } from '~/types';

export const usePaperList = defineStore('paper_list', {
  state: () => ({
    list: [] as TPaperListSafe,
    lastUpdate: 0,
  }),

  actions: {
    async getList() {
      const { $api } = useNuxtApp();
      const now = (new Date()).getTime();
      if (
        ['admin', 'teacher'].includes(useUserStore().role)
        || !this.list.length
        || now - this.lastUpdate > 10 * 60 * 1000 // 10min
      ) {
        this.list = await $api.paper.listSafe.query();
        this.lastUpdate = now;
      }

      const res = this.list.map((x) => {
        if (typeof x.createdAt === 'string')
          x.createdAt = new Date(x.createdAt);
        return x;
      });
      return res;
    },
  },
  persist: {
    storage: persistedState.localStorage,
  },
});
