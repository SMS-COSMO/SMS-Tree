import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const noteIdZod = z.string().min(1, '活动记录id不存在');
const createSafeZod = {
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
};

export const noteRouter = router({
  create: protectedProcedure
    .input(z.object({
      ...createSafeZod,
      groupId: z.string(),
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.noteController.create(input)).getResOrTRPCError();
    }),

  createSafe: protectedProcedure
    .input(z.object(createSafeZod))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.noteController.createSafe(input, ctx.user)).getResOrTRPCError();
    }),

  modifySafe: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...createSafeZod,
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.noteController.modifySafe(input, ctx.user)).getMsgOrTRPCError();
    }),

  info: protectedProcedure
    .input(z.object({ id: noteIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.noteController.getContent(input.id, ctx.user)).getResOrTRPCError();
    }),

  remove: protectedProcedure
    .input(z.object({ id: noteIdZod }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.noteController.remove(input.id, ctx.user)).getMsgOrTRPCError();
    }),
});
