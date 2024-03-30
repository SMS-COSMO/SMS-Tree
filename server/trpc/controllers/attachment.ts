import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { ctl } from '../context';
import { TRPCForbidden, useTry } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { allowedMainFileTypes, allowedSecondaryFileTypes } from '~/constants/attachment';
import { papers } from '~/server/db/schema/paper';

export class AttachmentController {
  async hasPerm(paperId: string | undefined | null, user: TRawUser, allowPublic: boolean = false) {
    // Teachers have all the perm
    if (['teacher', 'admin'].includes(user.role))
      return true;

    // Allowed when attachment is not attached to any paper (needed for paper creation)
    if (!paperId)
      return true;

    const paper = await db
      .select({
        groupId: papers.groupId,
        canDownload: papers.canDownload,
      })
      .from(papers)
      .where(eq(papers.id, paperId))
      .get();
    if (!paper?.groupId)
      return false;
    return (allowPublic && paper.canDownload) || await ctl.gc.hasUser(user.id, paper?.groupId);
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    if (
      (newAttachment.isMainFile && !allowedMainFileTypes.includes(newAttachment.fileType))
      || (!newAttachment.isMainFile && !allowedSecondaryFileTypes.includes(newAttachment.fileType))
    )
      throw new TRPCError({ code: 'BAD_REQUEST', message: '不允许的文件类型' });

    if (!await this.hasPerm(newAttachment.paperId, user))
      throw TRPCForbidden;

    const id = await useTry(
      async () => (await db.insert(attachments).values(newAttachment).returning({ id: attachments.id }).get()).id,
    );
    const url = await ctl.s3.getStandardUploadPresignedUrl(newAttachment.S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件上传URL' });
    return { id, url };
  }

  async modify(id: string, newAttachment: TNewAttachment, user: TRawUser) {
    const oldPaperId = (
      await useTry(
        () =>
          db
            .select({ paperId: attachments.paperId })
            .from(attachments)
            .where(eq(attachments.id, id))
            .get(),
        { code: 'INTERNAL_SERVER_ERROR', message: '无法获取附件' },
      )
    )?.paperId;

    if (await this.hasPerm(oldPaperId, user) && await this.hasPerm(newAttachment.paperId, user))
      await useTry(() => db.update(attachments).set(newAttachment).where(eq(attachments.id, id)));
    else
      throw TRPCForbidden;

    return '修改成功';
  }

  async bulkMoveToPaper(ids: string[], paperId: string, user: TRawUser) {
    if (!(await this.hasPerm(paperId, user)))
      return TRPCForbidden;

    try {
      await Promise.all(
        ids.map(id => db.update(attachments).set({ paperId }).where(eq(attachments.id, id))),
      );
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法更新附件' });
    }

    return '修改成功';
  }

  async remove(id: string, user: TRawUser) {
    const oldPaperId = (
      await useTry(
        () =>
          db
            .select({ paperId: attachments.paperId })
            .from(attachments)
            .where(eq(attachments.id, id))
            .get(),
        { code: 'INTERNAL_SERVER_ERROR', message: '无法获取附件' },
      )
    )?.paperId;

    if (await this.hasPerm(oldPaperId, user))
      await useTry(() => db.delete(attachments).where(eq(attachments.id, id)));
    else
      throw TRPCForbidden;

    return '删除成功';
  }

  async list() {
    const l = await useTry(() => db.select().from(attachments).all());
    return l;
  }

  /**
   * Retrieves the file URL for a given attachment ID without performing permission checks.
   * @param id - The ID of the attachment.
   * @returns A promise that resolves to a Result object containing the file URL if successful, or a Result object with an error message if unsuccessful.
   */
  async getFileUrlUncheckedPerm(id: string) {
    const attachment = await useTry(
      () => db.select({ S3FileId: attachments.S3FileId }).from(attachments).where(eq(attachments.id, id)).get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法获取附件' },
    );
    if (!attachment || !attachment.S3FileId)
      throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });

    const url = await ctl.s3.getFileUrl(attachment.S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件URL' });

    return url;
  }

  /**
   * Retrieves the file URL for a given attachment ID.
   *
   * Will check if the paper is downloadable before returning the URL.
   * If you want to bypass this check, use `getFileUrlUncheckedPerm` instead.
   *
   * @param id - The ID of the attachment.
   * @returns A Promise that resolves to a Result object containing the file URL if successful, or an error Result object if unsuccessful.
   */
  async getFileUrl(id: string, user: TRawUser) {
    const attachment = await useTry(
      () => db
        .select({
          S3FileId: attachments.S3FileId,
          paperId: attachments.paperId,
        })
        .from(attachments)
        .where(eq(attachments.id, id))
        .get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法获取附件' },
    );
    if (!attachment || !attachment.S3FileId || !attachment.paperId)
      throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });

    if (!await this.hasPerm(attachment.paperId, user, true))
      throw new TRPCError({ code: 'FORBIDDEN', message: '无下载权限' });

    const url = await ctl.s3.getFileUrl(attachment.S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件URL' });
    return url;
  }
}
