import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const classIdZod = z.string().min(1, '班级id不存在');

export const classRouter = router({
  create: protectedProcedure
    .input(z.object({
      index: z.number().int().min(0, '班级号至少为0').max(100, '班级号最大为100'),
      enterYear: z.number().int().min(2000, '请输入正确的入学年份').max(9999, '请输入正确的入学年份'),
      state: z.enum(['initialized', 'selectGroup', 'submitPaper', 'archived']),
      students: z.array(z.string().min(1, '学生不存在')),
      teacher: z.string().min(1, '老师不存在'),
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.classController.create(input)).getMsgOrTRPCError();
    }),

  content: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.classController.getContent(input.id)).getResOrTRPCError();
    }),

  fullContent: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return (await ctx.classController.getFullContent(input.id)).getResOrTRPCError();
    }),

  list: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      return (await ctx.classController.getList()).getResOrTRPCError();
    }),

  remove: protectedProcedure
    .input(z.object({ id: classIdZod }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.classController.remove(input.id)).getResOrTRPCError();
    }),

  initGroups: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: classIdZod,
      amount: z.number().int().gt(0).lte(20, '最多创建二十个班级'),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.classController.initGroups(input.id, input.amount)).getMsgOrTRPCError();
    }),
});
