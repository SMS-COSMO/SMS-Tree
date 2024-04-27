import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const categoryZod = z.enum(['thesisProposal', 'concludingReport']);
const groupIdZod = z.string().min(1, '小组id不存在');
const reportIdZod = z.string().min(1, '报告id不存在');

export const reportRouter = router({
  create: protectedProcedure
    .input(z.object({
      category: categoryZod,
      groupId: groupIdZod,
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.reportController.create(input);
    }),

  createSafe: protectedProcedure
    .input(z.object({
      category: categoryZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.reportController.createSafe(ctx.user, input.category);
    }),

  modify: protectedProcedure
    .input(
      z.object({
        category: z.enum(['thesisProposal', 'concludingReport']),
        comment: z.string().nullable(),
        read: z.boolean(),
      })
        .partial()
        .extend({ id: z.string().min(1) }),
    )
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.reportController.modify(id, data);
    }),

  remove: protectedProcedure
    .input(z.object({ id: reportIdZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.reportController.remove(input.id, ctx.user);
    }),
});
