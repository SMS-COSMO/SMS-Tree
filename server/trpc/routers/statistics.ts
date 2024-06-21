import { and, count, eq, inArray } from 'drizzle-orm';
import { protectedProcedure, requireRoles, router } from '../trpc';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema/user';
import { papers } from '~/server/db/schema/paper';
import { classes } from '~/server/db/schema/class';
import { groups } from '~/server/db/schema/group';

export const statisticsRouter = router({
  admin: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      // Student Count
      // TODO: maybe exclude archived students?
      async function getStudentCount() {
        return (await db.select({ count: count() }).from(users).where(eq(users.role, 'student')).get())?.count;
      };

      // Scoring Count
      async function getScorePaperCount() {
        const managedClasses = (await db.query.classes.findMany({
          where: ctx.user.role === 'admin' ? undefined : eq(classes.teacherId, ctx.user.id),
          columns: { id: true },
        })).map(x => x.id);

        const managedGroups = (await db.query.groups.findMany({
          where: and(
            inArray(
              groups.classId,
              managedClasses,
            ),
            eq(groups.archived, false),
          ),
          columns: { id: true },
        })).map(x => x.id);

        return (
          await db
            .select({ count: count() })
            .from(papers)
            .where(
              and(
                eq(papers.isPublic, false),
                inArray(papers.groupId, managedGroups),
              ),
            ).get()
        )?.count;
      }

      // Public Paper Count
      async function getPublicPaperCount() {
        return (await db.select({ count: count() }).from(papers).where(eq(papers.isPublic, true)).get())?.count;
      };

      // Class Count
      async function getClassCount() {
        return (await db.select({ count: count() }).from(classes).get())?.count;
      };

      const [
        studentCount,
        scorePaperCount,
        publicPaperCount,
        classCount,
      ] = await Promise.all([
        getStudentCount(),
        getScorePaperCount(),
        getPublicPaperCount(),
        getClassCount(),
      ]);

      return {
        studentCount,
        scorePaperCount,
        publicPaperCount,
        classCount,
      };
    }),
});
