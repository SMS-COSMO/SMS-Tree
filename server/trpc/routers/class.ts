import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const classIdSchema = z.string().min(1, '班级id不存在');
const stateSchema = z.enum([
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
]);

const createSchema = z.object({
  index: z.number().int().min(0, '班级号至少为0').max(100, '班级号最大为100'),
  enterYear: z.number().int().min(2000, '请输入正确的入学年份').max(9999, '请输入正确的入学年份'),
  state: stateSchema,
  teacherId: z.string().min(1, '老师不存在'),
  stateTimetable: z.array(z.date()).max(5, '最多5个状态').optional(),
});

export const classRouter = router({
  create: protectedProcedure
    .input(createSchema.extend({ students: z.array(z.string().min(1, '学生不存在')) }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.create(input);
    }),

  modify: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(createSchema.partial().extend({ id: classIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.classController.modify(id, data);
    }),

  info: protectedProcedure
    .input(z.object({ id: classIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.info(input.id);
    }),

  infoFull: protectedProcedure
    .input(z.object({ id: classIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.infoFull(input.id);
    }),

  list: protectedProcedure
    .input(z.string().optional())
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.getList(input);
    }),

  remove: protectedProcedure
    .input(z.object({ id: classIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.remove(input.id);
    }),

  batchRemove: protectedProcedure
    .input(z.object({ ids: classIdSchema.array() }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.batchRemove(input.ids);
    }),

  initGroups: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: classIdSchema,
      amount: z.number().int().gt(0).lte(20, '最多创建二十个班级'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.initGroups(input.id, input.amount);
    }),
});
