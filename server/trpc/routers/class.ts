import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, requireRoles, router } from '../trpc';

export const classRouter = router({
  create: protectedProcedure
    .input(z.object({
      index: z.number().min(0, '班级号至少为0').max(100, '班级号最大为100'),
      enterYear: z.number().min(2000, '请输入正确的入学年份').max(9999, '请输入正确的入学年份'),
      state: z.enum(['initialized', 'selectGroup', 'submitPaper', 'archived']),
      students: z.array(z.string().min(1, '学生不存在')),
      teacher: z.string().min(1, '老师不存在'),
    }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.classController.create(input);
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res;
    }),

  content: protectedProcedure
    .input(z.object({ id: z.string().min(1, '班级id不存在') }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.classController.getContent(input.id);
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  list: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      const res = await ctx.classController.getList();
      if (!res.res || !res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res.res;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1, '班级id不存在') }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.classController.remove(input.id);
      if (!res.success)
        throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
      else
        return res;
    }),
});
