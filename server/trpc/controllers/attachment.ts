import { eq } from 'drizzle-orm';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { PaperController } from './paper';
import { attachments } from '~/server/db/schema/attachment';

export class AttachmentController {
  private pc = new PaperController();
  private async hasPerm(paperId: string, user: TRawUser) {
    return await this.pc.hasUser(paperId, user.id) || ['teacher', 'admin'].includes(user.role);
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    try {
      if (await this.hasPerm(newAttachment.paperId, user))
        await db.insert(attachments).values(newAttachment);
      else
        return new ResultNoRes(false, '超出权限范围');
    } catch (err) {
      return new ResultNoRes(false, '服务器内部错误');
    }
    return new ResultNoRes(true, '创建成功');
  }

  async getContent(id: string, user: TRawUser) {
    try {
      const attachment = (await db.select().from(attachments).where(eq(attachments.id, id)))[0];
      if (await this.hasPerm(attachment.paperId, user))
        return new Result(true, '查询成功', attachment);
      return new ResultNoRes(false, '超出权限范围');
    } catch (err) {
      return new Result500();
    }
  }

  async remove(id: string, user: TRawUser) {
    try {
      const { paperId } = (await db.select().from(attachments).where(eq(attachments.id, id)))[0];
      if (await this.hasPerm(paperId, user))
        await db.delete(attachments).where(eq(attachments.id, id));
      else
        return new ResultNoRes(false, '超出权限范围');
    } catch (err) {
      return new ResultNoRes(false, '附件不存在');
    }
    return new ResultNoRes(true, '删除成功');
  }
}
