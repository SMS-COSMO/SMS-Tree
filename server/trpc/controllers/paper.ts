import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { TNewPaper, TRawUser } from '../../db/db';

import { papers } from '../../db/schema/paper';
import type { TAuthorPaper, TPaper } from '../serializer/paper';
import { paperFileSerializer, paperSerializer, paperWithAuthorSerializer } from '../serializer/paper';
import { papersToGroups } from '../../db/schema/paperToGroup';
import { GroupController } from './group';
import { UserController } from './user';

export class PaperController {
  async create(newPaper: TNewPaper & { groupId?: string }) {
    const { title, keywords, abstract, canDownload, S3FileId, groupId } = newPaper;
    const paper = { title, keywords, abstract, canDownload, S3FileId };

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

  async getContent(id: string) {
    try {
      const info = (await db.select().from(papers).where(eq(papers.id, id)))[0];
      const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));
      const paper = paperSerializer(info, groups.length ? groups[0].groupId : '');
      return { success: true, res: paper, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '论文不存在' };
    }
  }

  async getFile(id: string, role: TRawUser['role']) {
    try {
      const paper = (await db.select().from(papers).where(eq(papers.id, id)))[0];
      if (!paper.canDownload && role === 'student')
        return { success: false, message: '无下载权限' };

      const file = paperFileSerializer(paper);
      await db.update(papers).set({ downloadCount: paper.downloadCount + 1 }).where(eq(papers.id, id));
      return { success: true, res: file, message: '查询成功' };
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
      const res: Array<TAuthorPaper> = [];
      for (const paper of await db.select().from(papers)) {
        const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, paper.id));
        if (groups.length) {
          const gc = new GroupController();
          const uc = new UserController();

          const group = await gc.getContent(groups[0].groupId);
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

          res.push(paperWithAuthorSerializer(paper, authors, { username: leader.res.username, userId: leader.res.id }));
        }
      }

      return { success: true, res, message: '查询成功' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
  }
}
