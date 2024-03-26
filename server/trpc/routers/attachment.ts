import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const attachmentIdZod = z.string().min(0, '附件不存在');
const attachmentZod = z.object({
  paperId: z.string().optional(),
  name: z.string().min(0, '文件名最短为1').max(100, '文件名最长为100'),
  isMainFile: z.boolean(),
  fileType: z.string(),
  S3FileId: z.string().min(0, '请上传文件'),
});

export const attachmentRouter = router({
  create: protectedProcedure
    .input(attachmentZod)
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.create(input, ctx.user)).getResOrTRPCError();
    }),

  modify: protectedProcedure
    .input(z.object({ id: attachmentIdZod, newAttachment: attachmentZod }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.modify(input.id, input.newAttachment, ctx.user)).getMsgOrTRPCError();
    }),

  batchMoveToPaper: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      paperId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.bulkMoveToPaper(input.ids, input.paperId, ctx.user)).getMsgOrTRPCError();
    }),

  remove: protectedProcedure
    .input(z.object({ id: attachmentIdZod }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.attachmentController.remove(input.id, ctx.user)).getMsgOrTRPCError();
    }),

  list: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      return (await ctx.attachmentController.list()).getResOrTRPCError();
    }),

  // TODO: this seems unsafe
  fileUrl: protectedProcedure
    .input(attachmentIdZod)
    .query(async ({ ctx, input }) => {
      return (await ctx.attachmentController.getFileUrl(input, ctx.user)).getResOrTRPCError();
    }),
});
