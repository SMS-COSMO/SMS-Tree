import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, requireRoles, router } from '../trpc';

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
      const res = await ctx.paperController.create(input);
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res;
    }),

  content: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getContent(input.id);
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  contentWithAuthor: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getContentWithAuthor(input.id);
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.paperController.remove(input.id);
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res;
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const res = await ctx.paperController.getList();
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  listWithAuthor: protectedProcedure
    .query(async ({ ctx }) => {
      const res = await ctx.paperController.getListWithAuthor();
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  attachments: protectedProcedure
    .input(z.object({ id: z.string().min(1, '论文id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.paperController.getAttachments(input.id, ctx.user);
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),
});
