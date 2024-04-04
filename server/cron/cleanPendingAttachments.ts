/* eslint-disable no-console */
import { ctl } from '../trpc/context';
import { env } from '../env';
import { defineCronHandler } from '#nuxt/cron';

export default defineCronHandler(() => env.CRON_SCHEDULE, async () => {
  const res = await ctl.ac.cleanPendingAttachments();
  if (res) {
    console.log('Cleaned pending attachments');
    console.log(res);
  } else {
    console.log('No pending attachments to clean');
  }
});
