import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewReport, TRawUser } from '../../db/db';
import { TRPCForbidden } from '../utils/shared';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { reports } from '~/server/db/schema/report';

export class ReportController {
  async create(newReport: TNewReport) {
    const insertedId = (
      await db
        .insert(reports)
        .values(newReport)
        .returning({ id: reports.id })
    )[0].id;
    return insertedId;
  }

  async createSafe(user: TRawUser, category: 'thesisProposal' | 'concludingReport') {
    const group = (await db.query.usersToGroups.findMany({
      where: eq(usersToGroups.userId, user.id),
      columns: { groupId: true },
      with: {
        group: {
          columns: { archived: true },
        },
      },
    })).filter(g => !g.group.archived)[0];
    if (!group)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '用户无小组' });

    return await this.create({ groupId: group.groupId, category });
  }

  async modify(id: string, newReport: Partial<TNewReport>) {
    await db.update(reports).set(newReport).where(eq(reports.id, id));
    return '修改成功';
  }

  async remove(id: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      const group = await db.query.reports.findFirst({
        where: eq(reports.id, id),
        columns: {},
        with: {
          group: {
            columns: {},
            with: {
              usersToGroups: {
                columns: { userId: true },
              },
            },
          },
        },
      });

      if (!group || !group.group.usersToGroups.some(x => x.userId === user.id))
        throw TRPCForbidden;
    }

    await db.delete(reports).where(eq(reports.id, id));
    return '删除成功';
  }

  // This is currently not used
  async getContent(id: string, user: TRawUser) {
    const report = await db.query.reports.findFirst({
      where: eq(reports.id, id),
      with: {
        group: {
          columns: {},
          with: {
            usersToGroups: {
              columns: {},
              with: {
                user: {
                  columns: { id: true },
                },
              },
            },
          },
        },
        attachments: {
          columns: {
            category: true,
            createdAt: true,
            fileType: true,
            id: true,
            name: true,
            S3FileId: true,
          },
        },
      },
    });
    if (!report)
      throw new TRPCError({ code: 'NOT_FOUND', message: '报告不存在' });

    const isOwned = report.group.usersToGroups.some(x => x.user.id === user.id);
    const isAdmin = ['teacher', 'admin'].includes(user.role);
    if (!isOwned && !isAdmin)
      throw TRPCForbidden;

    const { group: _, ...res } = report;
    return res;
  }
}
