import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const attachmentIdZod = z.string().min(0, '附件不存在');

export const attachmentRouter = router({
  create: protectedProcedure
    .input(z.object({
      paperId: z.string().min(0, '论文不存在'),
      name: z.string().min(0, '文件名最短为1').max(100, '文件名最长为100'),
      isMainFile: z.boolean(),
      fileType: z.enum(['pdf', 'docx', 'image', 'video']),
      S3FileId: z.string().min(0, '请上传文件'),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.create(input, ctx.user)).getMsgOrTRPCError('BAD_REQUEST');
    }),

  content: protectedProcedure
    .input(z.object({ id: attachmentIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.attachmentController.getContent(input.id, ctx.user)).getResOrTRPCError('BAD_REQUEST');
    }),

  remove: protectedProcedure
    .input(z.object({ id: attachmentIdZod }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.remove(input.id, ctx.user)).getMsgOrTRPCError('BAD_REQUEST');
    }),
});
