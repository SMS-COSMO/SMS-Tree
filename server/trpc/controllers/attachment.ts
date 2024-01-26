import { eq } from 'drizzle-orm';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { PaperController } from './paper';
import { attachments } from '~/server/db/schema/attachment';

export class AttachmentController {
  private pc = new PaperController();
  private async hasUser(paperId: string, user: TRawUser) {
    return await this.pc.hasUser(paperId, user.id) || ['teacher', 'admin'].includes(user.role);
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    try {
      if (await this.hasUser(newAttachment.paperId, user))
        await db.insert(attachments).values(newAttachment);
      else
        return { success: false, message: '超出权限范围' };
    } catch (err) {
      return { success: false, message: '服务器内部错误' };
    }
    return { success: true, message: '创建成功' };
  }

  async remove(id: string, user: TRawUser) {
    try {
      const { paperId } = (await db.select().from(attachments).where(eq(attachments.id, id)))[0];
      if (await this.hasUser(paperId, user))
        await db.delete(attachments).where(eq(attachments.id, id));
      else
        return { success: false, message: '超出权限范围' };
    } catch (err) {
      return { success: false, message: '附件不存在' };
    }
    return { success: true, message: '删除成功' };
  }
}
