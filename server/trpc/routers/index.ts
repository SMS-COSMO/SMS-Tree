import { router } from '../trpc';
import { paperRouter } from './paper';
import { userRouter } from './user';
import { groupRouter } from './group';
import { classRouter } from './class';
import { attachmentRouter } from './attachment';
import { noteRouter } from './note';
import { reportRouter } from './report';

export const appRouter = router({
  user: userRouter,
  note: noteRouter,
  paper: paperRouter,
  group: groupRouter,
  class: classRouter,
  report: reportRouter,
  attachment: attachmentRouter,
});

export type AppRouter = typeof appRouter;
