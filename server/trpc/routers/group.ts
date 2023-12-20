import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, requireRoles, router } from '../trpc';

export const groupRouter = router({
    create: protectedProcedure
        .input(z.object({
            leader: z.string()
                .min(4, { message: '组长ID长度应至少为4' })
                .max(24, { message: '组长ID超出长度范围' }),
            members: z
                .array(z
                    .string()
                    .min(4, { message: '用户ID长度应至少为4' })
                    .max(24, { message: '用户ID超出长度范围' }),
                )
                .min(1, '请填写组员ID')
                .max(64, '组员最多64人'),
            classId: z.string().min(1, '班级ID不存在'),
            papers: z
                .array(z.string())
                .max(8, '小组最多8篇论文')
                .optional(),
            archived: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.groupController.create(input);
            if (!res.success)
                throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
            else
                return res;
        }),

    content: protectedProcedure
        .input(z.object({ id: z.string().min(1, '小组id不存在') }))
        .query(async ({ ctx, input }) => {
            const res = await ctx.groupController.getContent(input.id);
            if (!res.res || !res.success)
                throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
            else
                return res.res;
        }),

    list: protectedProcedure
        .query(async ({ ctx }) => {
            const res = await ctx.groupController.getList();
            if (!res.res || !res.success)
                throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
            else
                return res.res;
        }),
    modify: protectedProcedure
        .input(z.object({
            groupId: z.string().min(1, '不可以传入空ID'),
            newMembers: z.array(z.string().min(1, '不可以传入空ID')).nonempty('不可以传入空ID列表'),
            newLeader: z.string().min(1, '不可以传入空ID')
        }))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.groupController.modifyMembers(input.groupId, input.newMembers, input.newLeader);
            if (!res.success)
                throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
            else
                return res;
        }),
    remove: protectedProcedure
        .input(z.object({ id: z.string().min(1, '小组id不存在') }))
        .use(requireRoles(['admin', 'teacher']))
        .mutation(async ({ ctx, input }) => {
            const res = await ctx.groupController.remove(input.id);
            if (!res.success)
                throw new TRPCError({ code: 'BAD_REQUEST', message: res.message });
            else
                return res;
        }),
});
