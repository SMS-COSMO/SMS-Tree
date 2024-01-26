import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

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
      const res = await ctx.attachmentController.create(input, ctx.user);
      return res.getMsgOrTRPCError('BAD_REQUEST');
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.string().min(0, '附件不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.attachmentController.remove(input.id, ctx.user);
      return res.getMsgOrTRPCError('BAD_REQUEST');
    }),
});
