import { consola } from 'consola';
import { ctl } from '../trpc/context';

export default defineTask({
  meta: {
    name: 'cleanFiles',
    description: 'Clean unused attachment files',
  },
  async run() {
    const start = new Date();

    let res: string[] | undefined = [];
    try {
      res = await ctl.ac.cleanPendingAttachments();
    } catch {
      res = undefined;
    }

    const durationMs = Date.now() - start.getTime();

    consola.log(
      start.toLocaleString('zh-CN'),
      '|',
      `[${res ? 'ok' : 'error'}]`,
      `[tasks]`,
      `[${durationMs}ms]`,
      'cleanFiles',
      '->',
      `${res?.length} files cleaned`,
      '|',
      'server',
    );

    if (res === undefined)
      return { result: 'Failed' };
    if (!res.length)
      return { result: 'Nothing to clean' };
    return { result: 'Success' };
  },
});
