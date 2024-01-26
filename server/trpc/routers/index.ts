import { publicProcedure, router } from '../trpc';
import { paperRouter } from './paper';
import { userRouter } from './user';
import { groupRouter } from './group';
import { classRouter } from './class';
import { attachmentRouter } from './attachment';

export const appRouter = router({
  status: publicProcedure.query(() => 'Hola! This is working'),
  user: userRouter,
  paper: paperRouter,
  group: groupRouter,
  class: classRouter,
  attachment: attachmentRouter,
});

export type AppRouter = typeof appRouter;
