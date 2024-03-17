import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const paperIdZod = z.string().min(1, '论文id不存在');

export const paperRouter = router({
  create: protectedProcedure
    .input(z.object({
      title: z
        .string()
        .min(1, { message: '请输入论文标题' })
        .max(256, { message: '论文标题长度不应超过 256' }),
      keywords: z
        .array(z.string().max(8, { message: '关键词最长为8个字符' }))
        .max(8, { message: '最多8个关键词' }),
      abstract: z.string(),
      groupId: z.string().optional(),
      canDownload: z.boolean(),
      score: z.number().int().optional(),
      comment: z.string().optional(),
      isFeatured: z.boolean().optional().default(false),
      // TODO: status
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.create(input)).getResOrTRPCError();
    }),

  createSafe: protectedProcedure
    .input(z.object({
      title: z
        .string()
        .min(1, { message: '请输入论文标题' })
        .max(256, { message: '论文标题长度不应超过 256' }),
      keywords: z
        .array(z.string().max(8, { message: '关键词最长为8个字符' }))
        .max(8, { message: '最多8个关键词' }),
      abstract: z.string(),
      canDownload: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.createSafe(input, ctx.user)).getResOrTRPCError();
    }),

  info: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.paperController.getContent(input.id)).getResOrTRPCError();
    }),

  remove: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.remove(input.id)).getMsgOrTRPCError();
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return (await ctx.paperController.getList()).getResOrTRPCError();
    }),

  attachments: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.paperController.getAttachments(input.id, ctx.user)).getResOrTRPCError();
    }),

  updateDownloadCount: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.updateDownloadCount(input.id, ctx.user)).getMsgOrTRPCError();
    }),

  setComment: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      paperId: z.string().min(1, '小组id不存在'),
      comment: z.string().min(1, '评语长度不能为零').max(500, '评论最长为500'),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.setComment(input.paperId, input.comment)).getMsgOrTRPCError();
    }),
});
