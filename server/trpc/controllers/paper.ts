import { and, eq, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';
import { papers } from '../../db/schema/paper';
import { TRPCForbidden } from '../utils/shared';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { bookmarks } from '~/server/db/schema/bookmark';
import { className } from '~/utils/class';

export class PaperController {
  async create(newPaper: TNewPaper) {
    return (await db.insert(papers).values(newPaper).returning({ id: papers.id }))[0].id;
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'comment' | 'groupId'>,
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
    )[0].id;
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
        bookmarks: {
          columns: {
            userId: true,
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
      rawPaper.comment = null;
      if (!rawPaper.isPublic)
        throw TRPCForbidden;
      if (!rawPaper.canDownload)
        rawPaper.attachments = [];
      else // Students can only access paperDocuments
        rawPaper.attachments = rawPaper.attachments.filter(x => x.category === 'paperDocument');
    }

    const { group, bookmarks, ...info } = rawPaper;
    return {
      authors,
      ...info,
      leader: authors.find(x => x.id === group.leader),
      bookmarked: bookmarks.some(x => x.userId === user.id),
    };
  }

  async infoWithClass(id: string, user: TRawUser) {
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
        bookmarks: {
          columns: {
            userId: true,
          },
        },
      },
    });
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const authors = rawPaper.group.usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
    const { group, bookmarks, ...info } = rawPaper;
    return {
      authors,
      ...info,
      leader: authors.find(x => x.id === group.leader),
      class: {
        ...group.class,
        className: className(group.class),
      },
      bookmarked: bookmarks.some(x => x.userId === user.id),
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
          className: className(group.class),
        },
        ...info,
      };
    });
  }

  async modify(id: string, newPaper: Partial<TNewPaper>) {
    await db.update(papers).set(newPaper).where(eq(papers.id, id));
    return '修改成功';
  }

  async modifySafe(id: string, newPaper: Partial<TNewPaper>, user: TRawUser) {
    const group = (await db.query.usersToGroups.findMany({
      where: eq(usersToGroups.userId, user.id),
      columns: { groupId: true },
      with: {
        group: {
          columns: { archived: true },
          with: {
            paper: {
              columns: {
                isPublic: true,
              },
            },
          },
        },
      },
    })).filter(g => !g.group.archived)[0];
    if (!group)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户无小组' });
    if (!['teacher', 'admin'].includes(user.role) && group.group.paper?.isPublic)
      throw new TRPCError({ code: 'NOT_FOUND', message: '提交已截止，不能再修改论文' });

    await db
      .update(papers)
      .set(newPaper)
      .where(
        and(
          eq(papers.groupId, group.groupId),
          eq(papers.id, id),
        ),
      );
  }

  async score(
    id: string,
    newPaper: {
      isFeatured?: boolean;
      canDownload?: boolean;
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

  async toggleBookmark(paperId: string, user: TRawUser) {
    const isBookmarked = (await db.query.bookmarks.findFirst({
      where: and(
        eq(bookmarks.paperId, paperId),
        eq(bookmarks.userId, user.id),
      ),
    })) !== undefined;

    if (isBookmarked) { // un-bookmark
      await db.delete(bookmarks).where(
        and(
          eq(bookmarks.paperId, paperId),
          eq(bookmarks.userId, user.id),
        ),
      );
    } else { // bookmark
      await db.insert(bookmarks).values({ userId: user.id, paperId });
    }
  }

  async bookmarks(id: string) {
    return (
      await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, id),
        columns: {},
        with: {
          papers: {
            columns: {
              id: true,
            },
          },
        },
      })
    ).map(x => x.papers.id);
  }

  async bookmarksWithInfo(id: string) {
    const rawList = (
      await db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, id),
        columns: {},
        with: {
          papers: {
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
          },
        },
      })
    ).map(x => x.papers);

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
