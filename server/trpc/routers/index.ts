import { router } from '../trpc';
import { paperRouter } from './paper';
import { userRouter } from './user';
import { groupRouter } from './group';
import { classRouter } from './class';
import { attachmentRouter } from './attachment';
import { s3Router } from './s3';
import { noteRouter } from './note';

export const appRouter = router({
  user: userRouter,
  paper: paperRouter,
  group: groupRouter,
  class: classRouter,
  attachment: attachmentRouter,
  note: noteRouter,
  s3: s3Router,
});

export type AppRouter = typeof appRouter;
