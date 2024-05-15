import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const paperIdSchema = z.string().min(1, '论文id不存在');
const scoreEnumSchema = z.enum(['A', 'B', 'C', 'D'], { errorMap: () => ({ message: '请输入正确的等级' }) }).optional();

const createSchema = z.object({
  title: z
    .string()
    .min(1, { message: '请输入论文标题' })
    .max(256, { message: '论文标题长度不应超过 256' }),
  category: z.number().int(),
  keywords: z
    .array(z.string().max(8, { message: '关键词最长为8个字符' }))
    .max(8, { message: '最多8个关键词' }),
  abstract: z.string().max(5000, '摘要最长5000字'),
  groupId: z.string(),
  canDownload: z.boolean(),
  score: scoreEnumSchema,
  comment: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
});

export const paperRouter = router({
  create: protectedProcedure
    .input(createSchema)
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.create(input);
    }),

  createSafe: protectedProcedure
    .input(z.object({
      title: z
        .string()
        .min(1, { message: '请输入论文标题' })
        .max(256, { message: '论文标题长度不应超过 256' }),
      category: z.number().int(),
      keywords: z
        .array(z.string().max(8, { message: '关键词最长为8个字符' }))
        .max(8, { message: '最多8个关键词' }),
      abstract: z.string().max(5000, '摘要最长5000字'),
      canDownload: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.createSafe(input, ctx.user);
    }),

  info: protectedProcedure
    .input(z.object({ id: paperIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.info(input.id, ctx.user);
    }),

  infoWithClass: protectedProcedure
    .input(z.object({ id: paperIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.infoWithClass(input.id);
    }),

  remove: protectedProcedure
    .input(z.object({ id: paperIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.remove(input.id);
    }),

  modify: protectedProcedure
    .input(createSchema.extend({ id: paperIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.paperController.modify(id, data);
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.paperController.list(ctx.user);
    }),

  scoringList: protectedProcedure
    .input(z.string().optional())
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.paperController.scoringList(ctx.user, input);
    }),

  score: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      paperId: z.string().min(1, '论文id不存在'),
      newPaper: z.object({
        comment: z.string().min(1, '评语长度不能为零').max(500, '评论最长为500').optional(),
        isFeatured: z.boolean().optional(),
        score: scoreEnumSchema,
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.paperController.score(input.paperId, input.newPaper);
    }),
});
