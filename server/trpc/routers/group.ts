import { z } from 'zod';
import { protectedProcedure, requireRoles, router } from '../trpc';

export const groupRouter = router({
  create: protectedProcedure
    .input(z.object({
      leader: z.string()
        .max(24, { message: '组长Id超出长度范围' })
        .optional(),
      members: z
        .array(z
          .string()
          .min(4, { message: '用户Id长度应至少为4' })
          .max(24, { message: '用户Id超出长度范围' }),
        )
        .max(64, '组员最多64人')
        .optional(),
      classId: z.string().min(1, '班级Id不存在'),
      projectName: z.string().max(50, '课题名称最长为50').optional(),
      papers: z
        .array(z.string())
        .max(8, '小组最多8篇论文')
        .optional(),
      archived: z.boolean().optional(),
      enterYear: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.create(input);
    }),

  info: protectedProcedure
    .input(z.object({ id: z.string().min(1, '小组id不存在') }))
    .query(async ({ ctx, input }) => {
      return await ctx.groupController.info(input.id, ctx.user, true);
    }),

  listFull: protectedProcedure
    .input(z.object({ classId: z.string().optional() }))
    .use(requireRoles(['admin', 'teacher']))
    .query(async ({ ctx, input }) => {
      return await ctx.groupController.listFull(ctx.user, input.classId);
    }),

  list: protectedProcedure
    .input(z.object({ classId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.groupController.list(ctx.user, input.classId);
    }),

  modifyProjectName: protectedProcedure
    .input(z.object({
      groupId: z.string().min(1, '不可以传入空Id'),
      newProjectName: z.string().max(50, '课题名称最长为50'),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.groupController.modifyProjectName(input.groupId, input.newProjectName, ctx.user);
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().min(1, '小组id不存在') }))
    .use(requireRoles(['admin', 'teacher']))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.remove(input.id);
    }),

  join: protectedProcedure
    .input(z.object({
      groupId: z.string().min(1, '小组id不存在'),
      userId: z.string().min(1, '用户id不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.joinGroup(input.userId, input.groupId);
    }),

  leave: protectedProcedure
    .input(z.object({
      groupId: z.string().min(1, '小组id不存在'),
      userId: z.string().min(1, '用户id不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.leaveGroup(input.userId, input.groupId);
    }),

  change: protectedProcedure
    .input(z.object({
      oldGroupId: z.string().min(1, '小组id不存在'),
      userId: z.string().min(1, '用户id不存在'),
      newGroupId: z.string().min(1, '新小组id不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.changeGroup(input.userId, input.oldGroupId, input.newGroupId);
    }),

  setLeader: protectedProcedure
    .input(z.object({
      groupId: z.string().min(1, '小组id不存在'),
      userId: z.string().min(1, '用户id不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.setLeader(input.userId, input.groupId, ctx.user);
    }),

  removeLeader: protectedProcedure
    .input(z.object({
      groupId: z.string().min(1, '小组id不存在'),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.groupController.removeLeader(input.groupId, ctx.user);
    }),
});
