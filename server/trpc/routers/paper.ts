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
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.paperController.create(input)).getResOrTRPCError();
    }),

  content: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.paperController.getContent(input.id)).getResOrTRPCError();
    }),

  contentWithAuthor: protectedProcedure
    .input(z.object({ id: paperIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.paperController.getContentWithAuthor(input.id)).getResOrTRPCError();
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

  listWithAuthor: protectedProcedure
    .query(async ({ ctx }) => {
      return (await ctx.paperController.getListWithAuthor()).getResOrTRPCError();
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
});
