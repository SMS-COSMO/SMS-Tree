import { count, eq } from 'drizzle-orm';
import { protectedProcedure, requireRoles, router } from '../trpc';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema/user';
import { papers } from '~/server/db/schema/paper';
import { classes } from '~/server/db/schema/class';

export const statisticsRouter = router({
  admin: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async () => {
      // TODO: maybe exclude archived students?
      const studentCount = (await db.select({ count: count() }).from(users).where(eq(users.role, 'student')).get())?.count;
      const scorePaperCount = (await db.select({ count: count() }).from(papers).where(eq(papers.isPublic, false)).get())?.count;
      const publicPaperCount = (await db.select({ count: count() }).from(papers).where(eq(papers.isPublic, true)).get())?.count;
      const classCount = (await db.select({ count: count() }).from(classes).get())?.count;

      return {
        studentCount,
        scorePaperCount,
        publicPaperCount,
        classCount,
      };
    }),
});
