import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewReport, TRawReport, TRawUser } from '../../db/db';
import { ctl } from '../context';
import { TRPCForbidden, useTry } from '../utils/shared';
import { attachmentSerializer } from '../serializer/attachment';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { reports } from '~/server/db/schema/report';
import { attachments } from '~/server/db/schema/attachment';

export class ReportController {
  async create(newReport: TNewReport) {
    const insertedId = await useTry(
      async () => (await db.insert(reports).values(newReport).returning({ id: reports.id }).get()).id,
    );
    return insertedId;
  }

  async createSafe(user: TRawUser, category: 'thesisProposal' | 'concludingReport') {
    const group = await useTry(() => db
      .select({ groupId: usersToGroups.groupId })
      .from(usersToGroups)
      .where(eq(usersToGroups.userId, user.id))
      .get(),
    );
    if (!group)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '用户无小组' });

    const insertedId = await useTry(
      async () => (await db.insert(reports).values({ groupId: group.groupId, category }).returning({ id: reports.id }).get()).id,
    );
    return insertedId;
  }

  async remove(id: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      const { groupId } = await useTry(
        () => db.select({ groupId: reports.groupId }).from(reports).where(eq(reports.id, id)).get(),
      )
      ?? {};

      if (!groupId || !await ctl.gc.hasUser(user.id, groupId))
        throw TRPCForbidden;
    }

    await useTry(() => db.delete(reports).where(eq(reports.id, id)));
    return '删除成功';
  }

  async getContent(id: string, user: TRawUser, info?: TRawReport) {
    info ??= await useTry(() => db.select().from(reports).where(eq(reports.id, id)).get());
    if (!info)
      throw new TRPCError({ code: 'NOT_FOUND', message: '报告不存在' });

    if (!['admin', 'teacher'].includes(user.role)) {
      const members = await ctl.gc.getMembers(info.groupId);
      if (!await ctl.gc.hasUser(user.id, info.groupId, members))
        throw TRPCForbidden;
    }

    return info;
  }

  async getAttachments(id: string, user: TRawUser) {
    const rawReport = await useTry(
      () => db.select({ groupId: reports.groupId }).from(reports).where(eq(reports.id, id)).get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
    );
    if (!rawReport)
      throw new TRPCError({ code: 'NOT_FOUND', message: '报告不存在' });

    const isOwned = await ctl.gc.hasUser(user.id, rawReport.groupId);
    const isAdmin = ['teacher', 'admin'].includes(user.role);
    if (!isOwned && !isAdmin)
      throw TRPCForbidden;

    const attachmentList = await useTry(
      () => db.select().from(attachments).where(eq(attachments.reportId, id)),
    );
    const res = attachmentList.map(
      x => attachmentSerializer(x, isAdmin || isOwned),
    );
    return res;
  }
}
