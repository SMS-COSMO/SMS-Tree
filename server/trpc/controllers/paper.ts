import { and, eq, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';
import { papers } from '../../db/schema/paper';
import { TRPCForbidden } from '../utils/shared';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import type { TPaperScore } from '~/types';
import { useClassName } from '~/composables/className';

export class PaperController {
  async create(newPaper: TNewPaper) {
    return (await db.insert(papers).values(newPaper).returning({ id: papers.id }).get()).id;
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'score' | 'comment' | 'groupId'>,
    user: TRawUser,
  ) {
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
      rawPaper.score = null;
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
        className: useClassName(group.class),
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
        isFeatured: true,
        isPublic: true,
        keywords: true,
        score: true,
        title: true,
      },
      with: {
        group: {
          columns: { enterYear: true },
          with: {
            usersToGroups: {
              columns: {},
              with: {
                user: {
                  columns: { username: true, id: true },
                },
              },
            },
          },
        },
      },
    });

    return rawPaper.map((x) => {
      const isAdmin = ['teacher', 'admin'].includes(user.role);
      const isOwned = x.group.usersToGroups.some(u => u.user.id === user.id);
      if (!isOwned && !isAdmin)
        x.score = null;
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        enterYear: group.enterYear,
        ...info,
      };
    });
  }

  async scoringList() {
    const res = await db.query.papers.findMany({
      where: and(
        eq(papers.isPublic, false),
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
                id: true,
                enterYear: true,
                index: true,
              },
            },
          },
        },
      },
    });

    return res.map((x) => {
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        class: {
          ...group.class,
          className: useClassName(group.class),
        },
        ...info,
      };
    });
  }

  async modify(id: string, newPaper: Partial<TNewPaper>) {
    await db.update(papers).set(newPaper).where(eq(papers.id, id));
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

  async random(count: number) {
    const rawList = await db.query.papers.findMany({
      where: and(
        eq(papers.isFeatured, true),
        eq(papers.isPublic, true),
      ),
      columns: {
        id: true,
        canDownload: true,
        category: true,
        createdAt: true,
        isFeatured: true,
        keywords: true,
        title: true,
      },
      with: {
        group: {
          columns: { enterYear: true },
          with: {
            usersToGroups: {
              columns: {},
              with: {
                user: {
                  columns: { username: true, id: true },
                },
              },
            },
          },
        },
      },
      orderBy: sql`RANDOM()`,
      limit: count,
    });

    return rawList.map((x) => {
      const { group, ...info } = x;
      return {
        authors: group.usersToGroups.map(u => ({ username: u.user.username })),
        enterYear: group.enterYear,
        ...info,
      };
    });
  }
}
