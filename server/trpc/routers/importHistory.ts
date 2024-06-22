import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { protectedProcedure, requireRoles, router } from '../trpc';
import { db } from '~/server/db/db';
import { importHistory } from '~/server/db/schema/importHistory';

export const importHistoryRouter = router({
  list: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async () => {
      return await db.query.importHistory.findMany({
        columns: {
          id: true,
          createdAt: true,
        },
        with: {
          importer: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      });
    }),

  remove: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      ids: z.string().array(),
    }))
    .mutation(async ({ input }) => {
      await db.delete(importHistory).where(inArray(importHistory.id, input.ids));
    }),

  info: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.query.importHistory.findFirst({
        where: eq(importHistory.id, input.id),
        columns: {
          id: true,
          createdAt: true,
          data: true,
        },
        with: {
          importer: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      });
    }),
});
