import { eq } from 'drizzle-orm';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { ctl } from '../context';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { attachments } from '~/server/db/schema/attachment';
import { allowedMainFileTypes, allowedSecondaryFileTypes } from '~/constants/fileType';
import { papers } from '~/server/db/schema/paper';

export class AttachmentController {
  async hasPerm(paperId: string | undefined | null, user: TRawUser) {
    // Teachers have all the perm
    if (['teacher', 'admin'].includes(user.role))
      return true;

    // Allowed when attachment is not attached to any paper (needed for paper creation)
    if (!paperId)
      return true;

    const paper = await db.select({ groupId: papers.groupId }).from(papers).where(eq(papers.id, paperId)).get();
    if (!paper?.groupId)
      return false;
    return await ctl.pc.hasUser(user.id, paper?.groupId);
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    try {
      if (
        (newAttachment.isMainFile && !allowedMainFileTypes.includes(newAttachment.fileType))
        || (!newAttachment.isMainFile && !allowedSecondaryFileTypes.includes(newAttachment.fileType))
      )
        return new ResultNoRes(false, '不允许的文件类型');

      if (await this.hasPerm(newAttachment.paperId, user)) {
        const id = (await db.insert(attachments).values(newAttachment).returning({ id: attachments.id }).get()).id;
        return new Result(true, '创建成功', id);
      } else {
        return new ResultNoRes(false, '超出权限范围');
      }
    } catch (err) {
      return new Result500();
    }
  }

  async modify(id: string, newAttachment: TNewAttachment, user: TRawUser) {
    try {
      const oldPaperId = (
        await db
          .select({ paperId: attachments.paperId })
          .from(attachments)
          .where(eq(attachments.id, id))
          .get()
      )?.paperId;
      if (await this.hasPerm(oldPaperId, user) && await this.hasPerm(newAttachment.paperId, user))
        await db.update(attachments).set(newAttachment).where(eq(attachments.id, id));
      else
        return new ResultNoRes(false, '超出权限范围');
    } catch (err) {
      return new Result500();
    }
    return new ResultNoRes(true, '修改成功');
  }

  async bulkMoveToPaper(ids: string[], paperId: string, user: TRawUser) {
    try {
      if (!(await this.hasPerm(paperId, user)))
        return new ResultNoRes(false, '超出权限范围');
      await Promise.all(
        ids.map(id => db.update(attachments).set({ paperId }).where(eq(attachments.id, id))),
      );
    } catch (err) {
      return new Result500();
    }
    return new ResultNoRes(true, '修改成功');
  }

  async remove(id: string, user: TRawUser) {
    try {
      const paperId = (await db.select({ paperId: attachments.paperId }).from(attachments).where(eq(attachments.id, id)).get())?.paperId;
      if (await this.hasPerm(paperId, user))
        await db.delete(attachments).where(eq(attachments.id, id));
      else
        return new ResultNoRes(false, '超出权限范围');
    } catch (err) {
      return new ResultNoRes(false, '附件不存在');
    }
    return new ResultNoRes(true, '删除成功');
  }

  async list() {
    try {
      const l = await db.select().from(attachments).all();
      return new Result(true, '查询成功', l);
    } catch (err) {
      return new Result500();
    }
  }
}
