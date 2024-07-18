import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const paperIdSchema = z.string().min(1, '论文 ID 不存在');

const createSchema = z.object({
  title: z
    .string()
    .min(1, { message: '论文标题不能为空' })
    .max(256, { message: '论文标题最长为 256 字符' }),
  category: z.number().int(),
  keywords: z
    .array(z.string().max(8, { message: '关键词最长为 8 字符' }))
    .max(8, { message: '最多设置 8 个关键词' }),
  abstract: z.string().max(5000, '摘要最长为 5000 字符'),
  groupId: z.string(),
  canDownload: z.boolean(),
  comment: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
});

export const paperRouter = router({
  create: protectedProcedure
    .meta({ description: '创建论文。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.create(input);
    }),

  createSafe: protectedProcedure
    .input(z.object({
      title: z
        .string()
        .min(1, { message: '论文标题不能为空' })
        .max(256, { message: '论文标题最长为 256 字符' }),
      category: z.number().int(),
      keywords: z
        .array(z.string().max(8, { message: '关键词最长为 8 字符' }))
        .max(8, { message: '最多设置 8 个关键词' }),
      abstract: z.string().max(5000, '摘要最长为 5000 字符'),
      canDownload: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.createSafe(input, ctx.user);
    }),

  info: protectedProcedure
    .meta({ description: '获取论文信息。' })
    .input(z.object({ id: paperIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.info(input.id, ctx.user);
    }),

  infoWithClass: protectedProcedure
    .meta({ description: '获取包括班级在内的论文信息。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({ id: paperIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.infoWithClass(input.id, ctx.user);
    }),

  remove: protectedProcedure
    .meta({ description: '删除论文。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({ id: paperIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.remove(input.id);
    }),

  modify: protectedProcedure
    .meta({ description: '修改论文信息。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(createSchema.extend({ id: paperIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.paperController.modify(id, data);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.paperController.list(ctx.user);
    }),

  scoringList: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      return await ctx.paperController.scoringList();
    }),

  score: protectedProcedure
    .meta({ description: '提交对指定论文的评分和评语。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      paperId: z.string().min(1, '论文 ID 不存在'),
      newPaper: z.object({
        comment: z.string().min(1, '评语不能为空').max(500, '评语最长为 500 字符').optional(),
        isFeatured: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.score(input.paperId, input.newPaper);
    }),

  random: protectedProcedure
    .input(z.object({
      count: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.random(input.count);
    }),

  toggleBookmark: protectedProcedure
    .input(z.object({
      id: paperIdSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.toggleBookmark(input.id, ctx.user);
    }),

  bookmarks: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.paperController.bookmarks(ctx.user.id);
    }),

  bookmarksWithInfo: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.paperController.bookmarksWithInfo(ctx.user.id);
    }),
});
