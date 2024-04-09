import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const classIdZod = z.string().min(1, '班级id不存在');
const stateZod = z.enum([
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
  'archived', // 归档
]);

export const classRouter = router({
  create: protectedProcedure
    .input(z.object({
      index: z.number().int().min(0, '班级号至少为0').max(100, '班级号最大为100'),
      enterYear: z.number().int().min(2000, '请输入正确的入学年份').max(9999, '请输入正确的入学年份'),
      state: stateZod,
      students: z.array(z.string().min(1, '学生不存在')),
      teacherId: z.string().min(1, '老师不存在'),
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.create(input);
    }),

  modifyState: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({ id: classIdZod, newState: stateZod }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.modifyState(input.id, input.newState);
    }),

  content: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.getContent(input.id);
    }),

  fullContent: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.getFullContent(input.id);
    }),

  list: protectedProcedure
    .input(z.string().optional())
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.getList(input);
    }),

  remove: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.remove(input.id);
    }),

  initGroups: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: classIdZod,
      amount: z.number().int().gt(0).lte(20, '最多创建二十个班级'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.initGroups(input.id, input.amount);
    }),
});
