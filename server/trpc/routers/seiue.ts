import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, requireRoles, router } from '../trpc';
import { Seiue } from '../utils/seiue';

// everything here should be admin/teacher only
export const seiueRouter = router({
  login: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      schoolId: z.string().min(1).max(20),
      password: z.string().min(1).max(200), // who will have a 200-character password?
    }))
    .mutation(async ({ input }) => {
      const loginRes = await Seiue.login({
        schoolId: input.schoolId,
        password: input.password,
      });
      if (!loginRes)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });
      return loginRes;
    }),

  token: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      cookies: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      return await Seiue.retrieveToken(input.cookies);
    }),

  me: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx }) => {
      if (!ctx.seiueToken)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '请登陆希悦' });
      return await Seiue.me(ctx.seiueToken);
    }),
});
