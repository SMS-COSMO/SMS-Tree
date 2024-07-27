import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

const userIdSchema = z.string().min(1, '用户 ID 不存在');
const groupIdSchema = z.string().min(1, '小组 ID 不存在');

export const groupRouter = router({
  create: protectedProcedure
    .meta({ description: '创建小组。要求教师及以上权限。' })
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      leader: z.string()
        .max(24, { message: '组长 ID 超出长度范围' })
        .optional(),
      members: z
        .array(z
          .string()
          .min(4, { message: '用户 ID 长度应至少为 4' })
          .max(24, { message: '用户 ID 超出长度范围' }),
        )
        .max(64, '组员最多64人')
        .optional(),
      classId: z.string().min(1, '班级 ID 不存在'),
      projectName: z.string().max(50, '课题名称最长为 50 字符').optional(),
      papers: z
        .array(z.string())
        .max(8, '每个小组最多持有 8 篇论文')
        .optional(),
      archived: z.boolean().optional(),
      enterYear: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.create(input);
    }),

  info: protectedProcedure
    .meta({ description: '获取小组信息。' })
    .input(z.object({ id: groupIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.groupController.info(input.id, ctx.user);
    }),

  list: protectedProcedure
    .input(z.object({ classId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.groupController.list(ctx.user, input.classId);
    }),

  modifyProjectName: protectedProcedure
    .meta({ description: '修改课题名称。' })
    .input(z.object({
      groupId: groupIdSchema,
      newProjectName: z.string().max(50, '课题名称最长为 50 字符'),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.groupController.modifyProjectName(input.groupId, input.newProjectName, ctx.user);
    }),

  remove: protectedProcedure
    .meta({ description: '删除小组。' })
    .input(z.object({ id: groupIdSchema }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.remove(input.id);
    }),

  join: protectedProcedure
    .meta({ description: '加入小组。' })
    .input(z.object({
      groupId: groupIdSchema,
      userId: userIdSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.joinGroup(input.userId, input.groupId, ctx.user);
    }),

  leave: protectedProcedure
    .meta({ description: '离开小组。' })
    .input(z.object({
      groupId: groupIdSchema,
      userId: userIdSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.leaveGroup(input.userId, input.groupId, ctx.user);
    }),

  change: protectedProcedure
    .meta({ description: '变更用户所在的小组。' })
    .input(z.object({
      oldGroupId: z.string().min(1, '原小组 ID 不存在'),
      userId: userIdSchema,
      newGroupId: z.string().min(1, '新小组 ID 不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.changeGroup(input.userId, input.oldGroupId, input.newGroupId, ctx.user);
    }),

  setLeader: protectedProcedure
    .meta({ description: '设置组长。' })
    .input(z.object({
      groupId: groupIdSchema,
      userId: userIdSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.setLeader(input.userId, input.groupId, ctx.user);
    }),

  removeLeader: protectedProcedure
    .meta({ description: '取消组长。' })
    .input(z.object({ groupId: groupIdSchema }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.removeLeader(input.groupId, ctx.user);
    }),
});
