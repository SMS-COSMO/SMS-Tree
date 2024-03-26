import { router } from '../trpc';
import { paperRouter } from './paper';
import { userRouter } from './user';
import { groupRouter } from './group';
import { classRouter } from './class';
import { attachmentRouter } from './attachment';
import { noteRouter } from './note';

export const appRouter = router({
  user: userRouter,
  paper: paperRouter,
  group: groupRouter,
  class: classRouter,
  attachment: attachmentRouter,
  note: noteRouter,
});

export type AppRouter = typeof appRouter;
