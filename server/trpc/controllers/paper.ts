import { and, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import type { TNewPaper, TRawPaper, TRawUser } from '../../db/db';

import { papers } from '../../db/schema/paper';
import { paperSerializer } from '../serializer/paper';
import { attachmentSerializer } from '../serializer/attachment';
import { ctl } from '../context';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { requireTeacherOrThrow } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { usersToGroups } from '~/server/db/schema/userToGroup';

export class PaperController {
  async create(newPaper: TNewPaper) {
    try {
      const insertedId = (await db.insert(papers).values(newPaper).returning({ id: papers.id }).get()).id;
      return new Result(true, '创建成功', insertedId);
    } catch (err) {
      return new Result500();
    }
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'score' | 'comment' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = (
      await db
        .select({ groupId: usersToGroups.groupId })
        .from(usersToGroups)
        .where(eq(usersToGroups.userId, user.id))
        .get()
    );
    if (!group)
      return new ResultNoRes(false, '用户无小组');

    try {
      const insertedId = (
        await db
          .insert(papers)
          .values({ ...newPaper, groupId: group.groupId, isPublic: false })
          .returning({ id: papers.id })
          .get()
      ).id;
      return new Result(true, '创建成功', insertedId);
    } catch (err) {
      return new Result500();
    }
  }

  async remove(id: string) {
    try {
      await db.delete(papers).where(eq(papers.id, id));
      return new ResultNoRes(true, '删除成功');
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getBasicInfo(id: string) {
    try {
      const info = await db.select().from(papers).where(eq(papers.id, id)).get();
      return new Result(true, '查询成功', info);
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getContent(id: string, user: TRawUser, info?: TRawPaper) {
    try {
      info ??= await db.select().from(papers).where(eq(papers.id, id)).get();
      if (!info)
        return new ResultNoRes(false, '论文不存在');

      const members = (await ctl.gc.getMembers(info.groupId)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      const isOwned = await ctl.gc.hasUser(user.id, info.groupId, members);
      if (!info?.isPublic && !isOwned)
        requireTeacherOrThrow(user);

      return new Result(true, '查询成功', paperSerializer(info, members?.members, members?.leader));
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }
  }

  async getListSafe(user: TRawUser) {
    try {
      const res = await Promise.all(
        (await db.select().from(papers).where(eq(papers.isPublic, true)).all())
          .map(async (paper) => {
            return (await this.getContent(paper.id, user, paper)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
          }),
      );
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async getAttachments(id: string, user: TRawUser) {
    try {
      const rawPaper = await db
        .select({
          groupId: papers.groupId,
          isPublic: papers.isPublic,
          canDownload: papers.canDownload,
        })
        .from(papers)
        .where(eq(papers.id, id))
        .get();
      if (!rawPaper)
        return new ResultNoRes(false, '论文不存在');

      const isOwned = await ctl.gc.hasUser(user.id, rawPaper.groupId);
      const isAdmin = ['teacher', 'admin'].includes(user.role);
      if (!rawPaper.isPublic && !isOwned)
        requireTeacherOrThrow(user);

      const res = (
        (isOwned || isAdmin)
          ? await db
            .select().from(attachments)
            .where(eq(attachments.paperId, id))
          : await db // Students cannot access secondary files
            .select().from(attachments)
            .where(
              and(
                eq(attachments.isMainFile, true),
                eq(attachments.paperId, id),
              ),
            )
      ).map(
        x => attachmentSerializer(x, rawPaper.canDownload || isAdmin || isOwned),
      );

      return new Result(true, '查询成功', res);
    } catch (err) {
      return new ResultNoRes(false, '附件获取失败');
    }
  }

  // TODO: This seems unsafe
  async updateDownloadCount(id: string, user: TRawUser) {
    try {
      const rawPaper = await db
        .select({
          groupId: papers.groupId,
          downloadCount: papers.downloadCount,
          canDownload: papers.canDownload,
        })
        .from(papers)
        .where(eq(papers.id, id))
        .get();
      if (!rawPaper)
        return new ResultNoRes(false, '论文不存在');

      const isOwned = await ctl.gc.hasUser(user.id, rawPaper.groupId);
      if (rawPaper.canDownload && !isOwned && !['teacher', 'admin'].includes(user.role))
        await db.update(papers).set({ downloadCount: rawPaper.downloadCount + 1 }).where(eq(papers.id, id));

      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  async setComment(id: string, comment: string) {
    try {
      await db.update(papers).set({ comment }).where(eq(papers.id, id));
      return new ResultNoRes(true, '保存评语成功');
    } catch (err) {
      return new Result500();
    }
  }

  async setCanDownload(id: string, canDownload: boolean) {
    try {
      await db.update(papers).set({ canDownload }).where(eq(papers.id, id));
      return new ResultNoRes(true, '修改成功');
    } catch {
      return new Result500();
    }
  }

  async setIsFeatured(id: string, isFeatured: boolean) {
    try {
      await db.update(papers).set({ isFeatured }).where(eq(papers.id, id));
      return new ResultNoRes(true, '修改成功');
    } catch {
      return new Result500();
    }
  }
}
