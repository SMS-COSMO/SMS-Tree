import { and, eq, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';
import { papers } from '../../db/schema/paper';
import { attachmentSerializer } from '../serializer/attachment';
import { ctl } from '../context';
import { TRPCForbidden, useTry } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import type { TScore } from '~/types';

export class PaperController {
  async create(newPaper: TNewPaper) {
    const insertedId = (
      await useTry(
        () => db.insert(papers).values(newPaper).returning({ id: papers.id }).get(),
      )
    ).id;
    return insertedId;
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'score' | 'comment' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await useTry(() => db
      .select({ groupId: usersToGroups.groupId })
      .from(usersToGroups)
      .where(eq(usersToGroups.userId, user.id))
      .get(),
    );
    if (!group)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '用户无小组' });

    const insertedId = (
      await useTry(
        () => db
          .insert(papers)
          .values({ ...newPaper, groupId: group.groupId, isPublic: false })
          .returning({ id: papers.id })
          .get(),
      )
    ).id;
    return insertedId;
  }

  async remove(id: string) {
    await useTry(() => db.delete(papers).where(eq(papers.id, id)));
    return '删除成功';
  }

  async getBasicInfo(id: string) {
    const info = await useTry(() => db.select().from(papers).where(eq(papers.id, id)).get());
    return info;
  }

  async getContent(id: string, user: TRawUser) {
    const res = await useTry(
      () => db.query.papers.findFirst({
        where: eq(papers.id, id),
        with: {
          group: {
            columns: { leader: true },
            with: {
              usersToGroups: {
                columns: {},
                with: {
                  user: {
                    columns: {
                      id: true,
                      username: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const authors = res.group.usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
    if (!['admin', 'teacher'].includes(user.role) && !res?.isPublic) {
      if (!authors.some(x => x.id === user.id))
        throw TRPCForbidden;
    }

    const { group, ...info } = res;
    return {
      authors,
      ...info,
      leader: authors.find(x => x.id === group.leader),
    };
  }

  async getListSafe(user: TRawUser) {
    const res = await useTry(() => db.query.papers.findMany({
      where: ['admin', 'teacher'].includes(user.role) ? undefined : eq(papers.isPublic, true),
      columns: {
        id: true,
        canDownload: true,
        category: true,
        createdAt: true,
        downloadCount: true,
        isFeatured: true,
        keywords: true,
        score: true,
        title: true,
      },
      with: {
        group: {
          columns: {},
          with: {
            usersToGroups: {
              columns: {},
              with: {
                user: {
                  columns: { username: true },
                },
              },
            },
          },
        },
      },
    }));

    return res.map((x) => {
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        ...info,
      };
    });
  }

  // TODO: use query
  async getScoringList(user: TRawUser, classId?: string) {
    const classes = (
      user.role === 'admin'
        ? (await ctl.cc.getList()).map(x => x.id)
        : await ctl.uc.getTeacherClasses(user.id)
    ).filter(x => classId ? x === classId : true);

    const managedGroups = (
      await Promise.all(
        classes.map(
          async c => (await ctl.gc.getList(user, c)).map(x => x.id),
        ),
      )
    ).flat();

    if (!managedGroups.length)
      throw new TRPCError({ code: 'NOT_FOUND', message: '教师无小组' });

    const res = await useTry(() => db.query.papers.findMany({
      where: and(eq(papers.isPublic, false), inArray(papers.groupId, managedGroups)),
      columns: {
        id: true,
        category: true,
        createdAt: true,
        title: true,
      },
      with: {
        group: {
          columns: {},
          with: {
            usersToGroups: {
              columns: {},
              with: {
                user: {
                  columns: { username: true },
                },
              },
            },
          },
        },
      },
    }));

    return res.map((x) => {
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        ...info,
      };
    });
  }

  async getAttachments(id: string, user: TRawUser) {
    const rawPaper = await useTry(
      () => db.query.papers.findFirst({
        where: eq(papers.id, id),
        columns: {
          isPublic: true,
          canDownload: true,
        },
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
        },
      }),
      { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
    );
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const isOwned = rawPaper.group.usersToGroups.some(u => u.user.id === user.id);
    const isAdmin = ['teacher', 'admin'].includes(user.role);
    if (!isAdmin && !rawPaper.isPublic && !isOwned)
      throw TRPCForbidden;

    const attachmentList
      = await useTry(
        (isOwned || isAdmin)
          ? () => db
              .query.attachments.findMany({
                where: eq(attachments.paperId, id),
              })
          : () => db // Students only access paperDocuments
              .query.attachments.findMany({
                where: and(
                  eq(attachments.category, 'paperDocument'),
                  eq(attachments.paperId, id),
                ),
              }),
        { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
      );

    const res = attachmentList.map(
      x => attachmentSerializer(x, rawPaper.canDownload || isAdmin || isOwned),
    );

    return res;
  }

  // TODO: This seems unsafe
  async updateDownloadCount(id: string, user: TRawUser) {
    const rawPaper = await useTry(
      () => db.query.papers.findFirst({
        where: eq(papers.id, id),
        columns: {
          isPublic: true,
          canDownload: true,
          downloadCount: true,
        },
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
        },
      }),
      { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
    );
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const isOwned = rawPaper.group.usersToGroups.some(u => u.user.id === user.id);
    if (rawPaper.canDownload && !isOwned && !['teacher', 'admin'].includes(user.role))
      await useTry(() => db.update(papers).set({ downloadCount: rawPaper.downloadCount + 1 }).where(eq(papers.id, id)));

    return '修改成功';
  }

  async score(
    id: string,
    newPaper: {
      isFeatured?: boolean;
      score?: TScore;
      comment?: string;
    },
  ) {
    await useTry(() => db.update(papers).set({ ...newPaper, isPublic: true }).where(eq(papers.id, id)));
    return '批改成功';
  }
}
