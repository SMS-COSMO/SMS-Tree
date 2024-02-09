import { publicProcedure, router } from '../trpc';
import { paperRouter } from './paper';
import { userRouter } from './user';
import { groupRouter } from './group';
import { classRouter } from './class';
import { attachmentRouter } from './attachment';
import { s3Router } from './s3';

export const appRouter = router({
  status: publicProcedure.query(() => 'Hola! This is working'),
  user: userRouter,
  paper: paperRouter,
  group: groupRouter,
  class: classRouter,
  attachment: attachmentRouter,
  s3: s3Router,
});

export type AppRouter = typeof appRouter;
