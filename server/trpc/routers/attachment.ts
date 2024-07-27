import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

const categorySchema = z.enum(['paperDocument', 'paperAttachment', 'reportDocument', 'reportPresentation', 'noteAttachment']);
const attachmentIdSchema = z.string().min(1, '附件不存在');

export const attachmentRouter = router({
  create: protectedProcedure
    .meta({ description: '创建附件。' })
    .input(z.object({
      paperId: z.string().optional(),
      reportId: z.string().optional(),
      name: z.string().min(1, '文件名不能为空').max(100, '文件名最长为 100 字符'),
      fileType: z.string(),
      category: categorySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.create(input, ctx.user);
    }),

  batchMoveToPaper: protectedProcedure
    .meta({ description: '批量将附件关联到论文。' })
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
    .meta({ description: '批量将附件关联到报告。' })
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

  batchMoveToNote: protectedProcedure
    .meta({ description: '批量将附件关联到活动记录。' })
    .input(z.object({
      ids: z.array(z.string()),
      noteId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { noteId: input.noteId },
        { replace: false },
      );
    }),

  batchReplaceReport: protectedProcedure
    .meta({ description: '批量将附件关联到报告并覆盖。' })
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

  batchReplaceNote: protectedProcedure
    .meta({ description: '批量将附件关联到活动记录并覆盖。' })
    .input(z.object({
      ids: z.array(z.string()),
      noteId: z.string(),
      category: categorySchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { noteId: input.noteId },
        { replace: true, category: input.category },
      );
    }),

  batchReplacePaper: protectedProcedure
    .meta({ description: '批量将附件关联到论文并覆盖。' })
    .input(z.object({
      ids: z.array(z.string()),
      paperId: z.string(),
      category: categorySchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.attachmentController.batchMove(
        input.ids,
        ctx.user,
        { paperId: input.paperId },
        { replace: true, category: input.category },
      );
    }),

  // TODO: this seems unsafe
  fileUrl: protectedProcedure
    .meta({ description: '查询附件的 URL。' })
    .input(attachmentIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.attachmentController.getFileUrl(input, ctx.user);
    }),
});
