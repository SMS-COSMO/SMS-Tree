import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const attachmentIdZod = z.string().min(0, '附件不存在');
const attachmentZod = z.object({
  paperId: z.string().optional(),
  reportId: z.string().optional(),
  name: z.string().min(0, '文件名最短为1').max(100, '文件名最长为100'),
  fileType: z.string(),
  category: z.enum(['paperDocument', 'paperAttachment', 'reportDocument', 'reportPresentation']),
  S3FileId: z.string().min(0, '请上传文件'),
});

export const attachmentRouter = router({
  create: protectedProcedure
    .input(attachmentZod)
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.create(input, ctx.user);
    }),

  batchMoveToPaper: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      paperId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(input.ids, ctx.user, { paperId: input.paperId });
    }),

  batchMoveToReport: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      reportId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(input.ids, ctx.user, { reportId: input.reportId });
    }),

  list: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      return await ctx.attachmentController.list();
    }),

  // TODO: this seems unsafe
  fileUrl: protectedProcedure
    .input(attachmentIdZod)
    .query(async ({ ctx, input }) => {
      return await ctx.attachmentController.getFileUrl(input, ctx.user);
    }),
});
