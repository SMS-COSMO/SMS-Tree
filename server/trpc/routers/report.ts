import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const categorySchema = z.enum(['thesisProposal', 'concludingReport']);
const groupIdSchema = z.string().min(1, '小组id不存在');
const reportIdSchema = z.string().min(1, '报告id不存在');

export const reportRouter = router({
  create: protectedProcedure
    .input(z.object({
      category: categorySchema,
      groupId: groupIdSchema,
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.reportController.create(input);
    }),

  createSafe: protectedProcedure
    .input(z.object({
      category: categorySchema,
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
    .input(z.object({ id: reportIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.reportController.remove(input.id, ctx.user);
    }),
});
