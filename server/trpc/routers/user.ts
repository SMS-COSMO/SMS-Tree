import { z } from 'zod';
import { protectedProcedure, publicProcedure, requireRoles, router } from '../trpc';

const roleEnumSchema = z.enum(['student', 'teacher', 'admin'], { errorMap: () => ({ message: '提供的权限级别不存在' }) });
const userIdSchema = z.string().min(1, { message: '用户不存在' });
const schoolIdSchema = z.string().min(4, { message: '学工号长度至少为 4 字符' }).max(24, { message: '学工号超出长度范围' });
const usernameSchema = z.string().min(2, { message: '用户名长度至少为 2 字符' }).max(15, { message: '用户名超出长度范围' });
const newPasswordSchema = z.string().min(8, { message: '密码长度至少为 8 字符' });

export const userRouter = router({
  register: protectedProcedure
    .meta({ description: '注册用户。要求教师及以上权限。' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      schoolId: schoolIdSchema,
      role: roleEnumSchema,
      username: usernameSchema,
      password: newPasswordSchema,
      groupId: z.string().optional(),
      classId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.register(input);
    }),

  remove: protectedProcedure
    .meta({ description: '删除指定用户。要求教师及以上权限。' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({ id: userIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.remove(input.id);
    }),

  modifyPassword: protectedProcedure
    .meta({ description: '修改用户密码。' })
    .input(z.object({
      id: userIdSchema,
      oldPassword: z.string(),
      newPassword: newPasswordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.modifyPassword(ctx.user, input.id, input.oldPassword, input.newPassword);
    }),

  login: publicProcedure
    .meta({ description: '深中树用户登录。' })
    .input(z.object({ schoolId: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.login(input.schoolId, input.password, false);
    }),

  seiueLogin: publicProcedure
    .meta({ description: '希悦用户登录。' })
    .input(z.object({ schoolId: z.string(), password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.login(input.schoolId, input.password, true);
    }),

  tokenValidity: protectedProcedure
    .meta({ description: '核验令牌。' })
    .query(() => { }), // protectedProcedure will check if user is logged in

  refreshAccessToken: publicProcedure
    .meta({ description: '刷新令牌。' })
    .input(z.object({ username: z.string(), refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.refreshAccessToken(input.refreshToken, input.username);
    }),

  bulkRegister: protectedProcedure
    .meta({ description: '批量注册用户。要求教师及以上权限。' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      users: z.object({ schoolId: z.string().min(1).max(24), username: z.string().min(1) }).array().nonempty(),
      randomPassword: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.userController.bulkRegister(input.users, input.randomPassword);
    }),

  modify: protectedProcedure
    .meta({ description: '修改用户信息。要求教师及以上权限。' })
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({
      id: userIdSchema,
      schoolId: schoolIdSchema,
      username: usernameSchema,
      role: roleEnumSchema,
      classId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...newUser } = input;
      return await ctx.userController.modify(id, newUser);
    }),

  teacherClasses: protectedProcedure
    .meta({ description: '获取指定教师所负责的班级 ID 列表。要求教师及以上权限。' })
    .use(requireRoles(['teacher', 'admin']))
    .input(userIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.userController.teacherClasses(input);
    }),

  profile: protectedProcedure
    .meta({ description: '获取指定用户的用户信息。' })
    .input(z.object({ id: userIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.userController.profile(input.id, ctx.user);
    }),

  list: protectedProcedure
    .use(requireRoles(['teacher', 'admin']))
    .input(z.object({ role: roleEnumSchema.optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.userController.list(input.role ?? 'all');
    }),
});
