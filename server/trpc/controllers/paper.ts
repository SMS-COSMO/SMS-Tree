import { and, eq, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';
import { papers } from '../../db/schema/paper';
import { TRPCForbidden, getClassName } from '../utils/shared';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { classes } from '~/server/db/schema/class';
import { groups } from '~/server/db/schema/group';
import type { TPaperScore } from '~/types';

export class PaperController {
  async create(newPaper: TNewPaper) {
    return (await db.insert(papers).values(newPaper).returning({ id: papers.id }).get()).id;
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'score' | 'comment' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await db.query.usersToGroups.findFirst({
      where: eq(usersToGroups.userId, user.id),
      columns: { groupId: true },
    });
    if (!group)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '用户无小组' });

    const insertedId = (
      await db
        .insert(papers)
        .values({ ...newPaper, groupId: group.groupId, isPublic: false })
        .returning({ id: papers.id })
        .get()
    ).id;
    return insertedId;
  }

  async remove(id: string) {
    await db.delete(papers).where(eq(papers.id, id));
    return '删除成功';
  }

  async info(id: string, user: TRawUser) {
    const rawPaper = await db.query.papers.findFirst({
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

    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const authors = rawPaper.group.usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
    const isOwned = rawPaper.group.usersToGroups.some(u => u.user.id === user.id);
    const isAdmin = ['teacher', 'admin'].includes(user.role);

    if (!isAdmin && !isOwned) {
      if (!rawPaper.isPublic)
        throw TRPCForbidden;
      if (!rawPaper.canDownload)
        rawPaper.attachments = [];
      else // Students can only access paperDocuments
        rawPaper.attachments = rawPaper.attachments.filter(x => x.category === 'paperDocument');
    }

    const { group, ...info } = rawPaper;
    return {
      authors,
      ...info,
      leader: authors.find(x => x.id === group.leader),
    };
  }

  async infoWithClass(id: string) {
    const rawPaper = await db.query.papers.findFirst({
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
            class: {
              columns: {
                enterYear: true,
                id: true,
                index: true,
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
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const authors = rawPaper.group.usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
    const { group, ...info } = rawPaper;
    return {
      authors,
      ...info,
      leader: authors.find(x => x.id === group.leader),
      class: {
        ...group.class,
        className: getClassName(group.class),
      },
    };
  }

  async list(user: TRawUser) {
    const rawPaper = await db.query.papers.findMany({
      where: ['admin', 'teacher'].includes(user.role) ? undefined : eq(papers.isPublic, true),
      columns: {
        id: true,
        canDownload: true,
        category: true,
        createdAt: true,
        downloadCount: true,
        isFeatured: true,
        isPublic: true,
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
    });

    return rawPaper.map((x) => {
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        ...info,
      };
    });
  }

  async scoringList(user: TRawUser, classId?: string) {
    const managedClasses = await db.query.classes.findMany({
      where: user.role === 'admin' ? undefined : eq(classes.teacherId, user.id),
      columns: {
        id: true,
        enterYear: true,
        index: true,
      },
    });

    const managedGroups = (await db.query.groups.findMany({
      where: and(
        inArray(
          groups.classId,
          managedClasses
            .map(x => x.id)
            .filter(x => classId ? x === classId : true),
        ),
        eq(groups.archived, false),
      ),
      columns: { id: true },
    })).map(x => x.id);

    if (!managedGroups.length)
      throw new TRPCError({ code: 'NOT_FOUND', message: '教师无小组' });

    const res = await db.query.papers.findMany({
      where: and(
        eq(papers.isPublic, false),
        inArray(papers.groupId, managedGroups),
      ),
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
            class: {
              columns: {
                enterYear: true,
                index: true,
              },
            },
          },
        },
      },
    });

    return {
      managedClasses: managedClasses.map(x => ({ ...x, className: getClassName(x) })),
      list: res.map((x) => {
        const { group, ...info } = x;
        return {
          authors: group.usersToGroups.map(u => ({ username: u.user.username })),
          className: getClassName(group.class),
          ...info,
        };
      }),
    };
  }

  // TODO: This seems unsafe
  async updateDownloadCount(id: string, user: TRawUser) {
    const rawPaper = await db.query.papers.findFirst({
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
    });
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const isOwned = rawPaper.group.usersToGroups.some(u => u.user.id === user.id);
    if (rawPaper.canDownload && !isOwned && !['teacher', 'admin'].includes(user.role))
      await db.update(papers).set({ downloadCount: rawPaper.downloadCount + 1 }).where(eq(papers.id, id));

    return '修改成功';
  }

  async score(
    id: string,
    newPaper: {
      isFeatured?: boolean;
      score?: TPaperScore;
      comment?: string;
    },
  ) {
    await db.update(papers).set({ ...newPaper, isPublic: true }).where(eq(papers.id, id));
    return '批改成功';
  }
}
