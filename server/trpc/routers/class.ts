import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const classIdSchema = z.string().min(1, '班级 ID 不存在');
const stateSchema = z.enum([
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
]);

const createSchema = z.object({
  index: z.number().int().min(0, '班级号至少为 0').max(100, '班级号最大为 100'),
  enterYear: z.number().int().min(2000, '请输入正确的入学年份').max(9999, '请输入正确的入学年份'),
  state: stateSchema,
  teacherId: z.string().min(1, '教师 ID 不存在'),
  stateTimetable: z.array(z.date()).max(5, '每个班级最多存在 5 个状态').optional(),
});

export const classRouter = router({
  create: protectedProcedure
    .meta({ description: '创建班级。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(createSchema.extend({ students: z.array(z.string().min(1, '学生 ID 不存在')) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.create(input);
    }),

  modify: protectedProcedure
    .meta({ description: '修改班级信息。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(createSchema.partial().extend({ id: classIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.classController.modify(id, data);
    }),

  info: protectedProcedure
    .meta({ description: '获取班级信息。' })
    .input(z.object({ id: classIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.info(input.id);
    }),

  infoFull: protectedProcedure
    .meta({ description: '获取完整的班级信息。要求教师及以上权限。' })
    .input(z.object({ id: classIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.classController.infoFull(input.id);
    }),

  list: protectedProcedure
    .meta({ description: '列出班级。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      return await ctx.classController.getList(input);
    }),

  remove: protectedProcedure
    .meta({ description: '删除班级。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({ id: classIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.remove(input.id);
    }),

  batchRemove: protectedProcedure
    .meta({ description: '批量删除班级。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({ ids: classIdSchema.array() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.batchRemove(input.ids);
    }),

  initGroups: protectedProcedure
    .meta({ description: '批量初始化新小组。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      id: classIdSchema,
      amount: z.number().int().gt(0).lte(20, '最多同时创建 20 个小组'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.classController.initGroups(input.id, input.amount);
    }),
});
