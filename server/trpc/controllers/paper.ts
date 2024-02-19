import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { TNewPaper, TRawPaper, TRawUser } from '../../db/db';

import { papers } from '../../db/schema/paper';
import type { TAuthorPaper, TPaper } from '../serializer/paper';
import { paperSerializer, paperWithAuthorSerializer } from '../serializer/paper';
import { papersToGroups } from '../../db/schema/paperToGroup';
import { attachmentSerializer } from '../serializer/attachment';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { GroupController } from './group';
import { UserController } from './user';
import { attachments } from '~/server/db/schema/attachment';

export class PaperController {
  private gc = new GroupController();
  private uc = new UserController();

  async create(newPaper: TNewPaper & { groupId?: string }) {
    const { groupId, ...paper } = newPaper;

    try {
      const insertedId = (await db.insert(papers).values(paper).returning({ id: papers.id }))[0].id;
      if (groupId)
        await db.insert(papersToGroups).values({ groupId, paperId: insertedId });
      return new Result(true, '创建成功', insertedId);
    } catch (err) {
      return new Result500();
    }
  }

  async remove(id: string) {
    try {
      await db.delete(papersToGroups).where(eq(papersToGroups.paperId, id));
      await db.delete(papers).where(eq(papers.id, id));
      return new ResultNoRes(true, '删除成功');
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getAuthors(groupId: string) {
    const group = (await this.gc.getContent(groupId)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
    const leader = (await this.uc.getProfile(group.leader)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
    const authors = await Promise.all(
      (group.members ?? [])
        .map(async (author) => {
          const usr = (await this.uc.getProfile(author)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
          if (!usr)
            return { id: '', username: '' };
          return {
            id: usr.id,
            username: usr.username,
          };
        }),
    );

    return new Result(true, '查询成功', { authors, leader: { id: leader.id, username: leader.username } });
  }

  async getContent(id: string) {
    try {
      const info = (await db.select().from(papers).where(eq(papers.id, id)))[0];
      const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));
      return new Result(true, '查询成功', paperSerializer(info, groups[0].groupId));
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getContentWithAuthor(id: string, info?: TRawPaper) {
    try {
      const realInfo = info ?? (await db.select().from(papers).where(eq(papers.id, id)))[0];
      const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, id));
      let res;
      try {
        res = (await this.getAuthors(groups[0].groupId)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      } catch (err) { }

      return new Result(true, '查询成功', paperWithAuthorSerializer(realInfo, res?.authors, res?.leader));
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getList() {
    try {
      const res = await Promise.all(
        (await db.select().from(papers))
          .map(async (paper) => {
            const groups = await db.select().from(papersToGroups).where(eq(papersToGroups.paperId, paper.id));
            return paperSerializer(paper, groups.length ? groups[0].groupId : '');
          }),
      );
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async getListWithAuthor() {
    try {
      const res = await Promise.all(
        (await db.select().from(papers))
          .map(async (paper) => {
            return (await this.getContentWithAuthor(paper.id, paper)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
          }),
      );
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async getAttachments(id: string, user: TRawUser) {
    try {
      const { canDownload, downloadCount } = (await this.getContent(id)).res ?? { canDownload: false, downloadCount: 0 };
      const isOwned = await this.hasUser(id, user.id);
      const res = (await db.select().from(attachments).where(eq(attachments.paperId, id))).map(
        x => attachmentSerializer(x, canDownload || ['teacher', 'admin'].includes(user.role) || isOwned),
      );
      if (canDownload && !isOwned && !['teacher', 'admin'].includes(user.role))
        await db.update(papers).set({ downloadCount: downloadCount + 1 }).where(eq(papers.id, id));

      return new Result(true, '查询成功', res);
    } catch (err) {
      return new ResultNoRes(false, '附件获取失败');
    }
  }

  async hasUser(id: string, userId: string) {
    try {
      const { authors } = (await this.getContentWithAuthor(id)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      if (authors)
        return authors.some(x => x.id === userId);
      return false;
    } catch (err) {
      return false;
    }
  }
}
