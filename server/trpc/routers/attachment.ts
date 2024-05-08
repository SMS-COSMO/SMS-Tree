import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const categorySchema = z.enum(['paperDocument', 'paperAttachment', 'reportDocument', 'reportPresentation']);
const attachmentIdSchema = z.string().min(0, '附件不存在');
const attachmentSchema = z.object({
  paperId: z.string().optional(),
  reportId: z.string().optional(),
  name: z.string().min(0, '文件名最短为1').max(100, '文件名最长为100'),
  fileType: z.string(),
  category: categorySchema,
  S3FileId: z.string().min(0, '请上传文件'),
});

export const attachmentRouter = router({
  create: protectedProcedure
    .input(attachmentSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.create(input, ctx.user);
    }),

  batchMoveToPaper: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      paperId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { paperId: input.paperId },
        { replace: false },
      );
    }),

  batchMoveToReport: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      reportId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { reportId: input.reportId },
        { replace: false },
      );
    }),

  batchReplaceReport: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      reportId: z.string(),
      category: categorySchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { reportId: input.reportId },
        { replace: true, category: input.category },
      );
    }),

  // TODO: this seems unsafe
  fileUrl: protectedProcedure
    .input(attachmentIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.attachmentController.getFileUrl(input, ctx.user);
    }),
});
