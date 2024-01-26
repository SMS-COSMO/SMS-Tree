import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';

import { papers } from '../../db/schema/paper';
import type { TAuthorPaper, TPaper } from '../serializer/paper';
import { paperSerializer, paperWithAuthorSerializer } from '../serializer/paper';
import { papersToGroups } from '../../db/schema/paperToGroup';
import { attachmentSerializer } from '../serializer/attachment';
import { GroupController } from './group';
import { UserController } from './user';
import { attachments } from '~/server/db/schema/attachment';

export class PaperController {
  async create(newPaper: TNewPaper & { groupId?: string }) {
    const { groupId, ...paper } = newPaper;

    try {
      const insertedId = (await db.insert(papers).values(paper).returning({ id: papers.id }))[0].id;
      if (groupId)
        await db.insert(papersToGroups).values({ groupId, paperId: insertedId });
      return { success: true, message: '创建成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }

  async remove(id: string) {
    try {
      await db.delete(papersToGroups).where(eq(papersToGroups.paperId, id));
      await db.delete(papers).where(eq(papers.id, id));
      return { success: true, message: '删除成功' };
    } catch (err) {
      return { success: false, message: '论文不存在' };
    }
  }

  async getAuthors(groupId: string) {
    const gc = new GroupController();
    const uc = new UserController();

    const group = await gc.getContent(groupId);
    if (!group.success || !group.res)
      return { success: false, message: group.message ?? '服务器内部错误' };

    const authors = await Promise.all(
      (group.res.members ?? [])
        .map(async (author) => {
          const usr = (await uc.getProfile(author)).res;
          if (!usr)
            return { userId: '', username: '' };
          return {
            userId: usr.id,
            username: usr.username,
          };
        }),
    );
    const leader = await uc.getProfile(group.res.leader);
    if (!leader.success || !leader.res)
      return { success: false, message: leader.message ?? '服务器内部错误' };

    return {
      success: true,
      res: {
        authors,
        leader: {
          username: leader.res.username,
          userId: leader.res.id,
        },
      },
    };
  }

  async getContent(id: string) {
    try {
      const info = (await db.select().from(papers).where(eq(papers.id, id)))[0];
      const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));
      const paper = paperSerializer(info, groups[0].groupId);
      return { success: true, res: paper, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '论文不存在' };
    }
  }

  async getContentWithAuthor(id: string) {
    try {
      const info = (await db.select().from(papers).where(eq(papers.id, id)))[0];
      const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));

      const res = await this.getAuthors(groups[0].groupId);
      if (!res.success || !res.res)
        return { success: false, message: res.message ?? '服务器内部错误' };

      const paper = paperWithAuthorSerializer(info, res.res.authors, res.res.leader);
      return { success: true, res: paper, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '论文不存在' };
    }
  }

  async getList() {
    try {
      const res: Array<TPaper> = [];
      for (const paper of await db.select().from(papers)) {
        const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, paper.id));
        res.push(paperSerializer(paper, groups.length ? groups[0].groupId : ''));
      }

      return { success: true, res, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }

  async getListWithAuthor() {
    try {
      const list: Array<TAuthorPaper> = [];
      for (const paper of await db.select().from(papers)) {
        const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, paper.id));
        if (groups.length) {
          const res = await this.getAuthors(groups[0].groupId);
          if (!res.success || !res.res)
            return { success: false, message: res.message ?? '服务器内部错误' };

          list.push(paperWithAuthorSerializer(paper, res.res.authors, res.res.leader));
        }
      }
      return { success: true, res: list, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }

  async getAttachments(id: string, user: TRawUser) {
    try {
      const { canDownload, downloadCount } = (await this.getContent(id)).res ?? { canDownload: false, downloadCount: 0 };
      const isOwned = await this.hasUser(id, user.id);
      const res = (await db.select().from(attachments).where(eq(attachments.paperId, id))).map(
        x => attachmentSerializer(x, canDownload || ['teacher', 'admin'].includes(user.role) || isOwned),
      );
      if (canDownload && !isOwned)
        await db.update(papers).set({ downloadCount: downloadCount + 1 }).where(eq(papers.id, id));

      return { success: true, res, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '附件获取失败' };
    }
  }

  async hasUser(id: string, userId: string) {
    try {
      const authors = (await this.getContentWithAuthor(id)).res?.authors;
      if (authors)
        return authors.some(x => x.userId === userId);
      return false;
    } catch (err) {
      return false;
    }
  }
}
