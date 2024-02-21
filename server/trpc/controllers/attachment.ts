import { eq } from 'drizzle-orm';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { PaperController } from './paper';
import { attachments } from '~/server/db/schema/attachment';

export class AttachmentController {
  private pc = new PaperController();
  private async hasPerm(paperId: string | undefined | null, user: TRawUser) {
    if (!paperId)
      return true;
    return await this.pc.hasUser(paperId, user.id) || ['teacher', 'admin'].includes(user.role);
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    try {
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
      const oldPaperId = (await db.select({ paperId: attachments.paperId }).from(attachments).where(eq(attachments.id, id)).get())?.paperId;
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
