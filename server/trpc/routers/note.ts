import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const noteIdSchema = z.string().min(1, '活动记录id不存在');
const createSafeSchema = z.object({
  title: z
    .string()
    .min(1, { message: '请输入活动记录主题' })
    .max(256, { message: '活动记录主题长度不应超过 256' }),
  time: z.date(),
  followUp: z.string().max(1000, '上次活动跟进最长1000字'),
  newDiscussion: z.string().max(1000, '新的讨论内容最长1000字'),
  content: z.string().max(1000, '活动笔记最长1000字'),
  plans: z.string().max(1000, '下次活动计划最长1000字'),
  reflections: z.string().max(1000, '反思最长1000字'),
});

export const noteRouter = router({
  create: protectedProcedure
    .input(createSafeSchema.extend({ groupId: z.string() }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.noteController.create(input);
    }),

  createSafe: protectedProcedure
    .input(createSafeSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.noteController.createSafe(input, ctx.user);
    }),

  modifySafe: protectedProcedure
    .input(createSafeSchema.extend({ id: noteIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.noteController.modifySafe(input, ctx.user);
    }),

  remove: protectedProcedure
    .input(z.object({ id: noteIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.noteController.remove(input.id, ctx.user);
    }),
});
