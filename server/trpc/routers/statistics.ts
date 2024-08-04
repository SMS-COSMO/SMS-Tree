import { and, count, eq, inArray } from 'drizzle-orm';
import { protectedProcedure, requireRoles, router } from '../trpc';
import { db } from '~/server/db/db';
import { papers } from '~/server/db/schema/paper';
import { classes } from '~/server/db/schema/class';
import { groups } from '~/server/db/schema/group';

export const statisticsRouter = router({
  admin: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      const managedClassesRaw = (await db.query.classes.findMany({
        where: ctx.user.role === 'admin' ? undefined : eq(classes.teacherId, ctx.user.id),
        columns: { id: true },
        with: {
          classesToStudents: {
            columns: {
              userId: true,
            },
          },
        },
      }));
      const managedClasses = managedClassesRaw.map(x => x.id);

      // Student Count
      function getStudentCount() {
        let sum = 0;
        for (const x of managedClassesRaw)
          sum += x.classesToStudents.length;
        return sum;
      };

      // Scoring Count
      async function getScorePaperCount() {
        if (!managedClasses.length)
          return 0;

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
        if (!managedGroups.length)
          return 0;

        return (
          await db
            .select({ count: count() })
            .from(papers)
            .where(
              and(
                eq(papers.isPublic, false),
                inArray(papers.groupId, managedGroups),
              ),
            )
        )[0]?.count;
      }

      // Public Paper Count
      async function getPublicPaperCount() {
        return (await db.select({ count: count() }).from(papers).where(eq(papers.isPublic, true)))[0]?.count;
      };

      const [
        scorePaperCount,
        publicPaperCount,
      ] = await Promise.all([
        getScorePaperCount(),
        getPublicPaperCount(),
      ]);

      return {
        studentCount: getStudentCount(),
        scorePaperCount,
        publicPaperCount,
        classCount: managedClasses.length,
      };
    }),
});
