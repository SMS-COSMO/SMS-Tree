import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const roleEnumZod = z.enum(['student', 'teacher', 'admin'], { errorMap: () => ({ message: '提交了不存在的用户身份' }) });
const userIdZod = z.string().min(1, { message: '用户不存在' });

export const userRouter = router({
  register: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: z.string().min(4, { message: '用户ID长度应至少为4' }).max(24, { message: '用户ID超出长度范围' }),
      role: roleEnumZod,
      username: z.string().min(2, { message: '用户名长度应至少为2' }).max(15, { message: '用户名超出长度范围' }),
      password: z.string().min(8, { message: '用户密码长度应至少为8' }),
      groupIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.register(input)).getMsgOrTRPCError();
    }),

  remove: protectedProcedure
    .input(z.object({ id: userIdZod }))
    .use(requireRoles(['teacher', 'admin']))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.remove(input.id)).getMsgOrTRPCError();
    }),

  modifyPassword: protectedProcedure
    .input(z.object({
      id: userIdZod,
      oldPassword: z.string(),
      newPassword: z.string().min(8, { message: '用户密码长度应至少为8' }),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.modifyPassword(ctx.user, input.id, input.oldPassword, input.newPassword)).getMsgOrTRPCError();
    }),

  login: publicProcedure
    .input(z.object({ id: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.login(input.id, input.password)).getResOrTRPCError();
    }),

  tokenValidity: protectedProcedure
    .query(() => { }), // protectedProcedure will check if user is logged in

  refreshAccessToken: publicProcedure
    .input(z.object({ username: z.string(), refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.refreshAccessToken(input.refreshToken, input.username)).getResOrTRPCError();
    }),

  bulkRegister: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      users: z.object({ id: z.string().min(1).max(24), username: z.string().min(1) }).array().nonempty(),
      randomPassword: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return (await ctx.userController.bulkRegister(input.users, input.randomPassword)).getMsgOrTRPCError();
    }),

  profile: protectedProcedure
    .input(z.object({ id: userIdZod }))
    .query(async ({ ctx, input }) => {
      return (await ctx.userController.getProfile(input.id)).getResOrTRPCError();
    }),

  list: protectedProcedure
    .input(z.object({ role: roleEnumZod.optional() }))
    .use(requireRoles(['teacher', 'admin']))
    .query(async ({ ctx, input }) => {
      return (await ctx.userController.getList(input.role ?? 'all')).getResOrTRPCError();
    }),
});
