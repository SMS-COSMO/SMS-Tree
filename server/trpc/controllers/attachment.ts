import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { ctl } from '../context';
import { TRPCForbidden, useTry } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { allowFileType } from '~/constants/attachment';
import { papers } from '~/server/db/schema/paper';
import { reports } from '~/server/db/schema/report';
import type { TAttachmentCategory } from '~/types';

export class AttachmentController {
  async hasPerm(
    user: TRawUser,
    id: { paperId?: string | undefined | null; reportId?: string | undefined | null },
    allowPublic: boolean = false,
  ) {
    // Teachers have all the perm
    if (['teacher', 'admin'].includes(user.role))
      return true;

    // Allowed when attachment is not attached to any paper (needed for paper/report creation)
    if (!id.paperId && !id.reportId)
      return true;

    if (id.paperId) {
      const paper = await db
        .select({
          groupId: papers.groupId,
          canDownload: papers.canDownload,
        })
        .from(papers)
        .where(eq(papers.id, id.paperId))
        .get();
      if (!paper?.groupId)
        return false;
      return (allowPublic && paper.canDownload) || await ctl.gc.hasUser(user.id, paper?.groupId);
    }

    if (id.reportId) {
      const report = await db.select({ groupId: reports.groupId }).from(reports).where(eq(reports.id, id.reportId)).get();
      if (!report?.groupId)
        return false;
      return allowPublic || await ctl.gc.hasUser(user.id, report.groupId);
    }
  };

  async create(newAttachment: TNewAttachment, user: TRawUser) {
    if (!allowFileType[newAttachment.category].includes(newAttachment.fileType))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '不允许的文件类型' });

    if (!await this.hasPerm(user, { paperId: newAttachment.paperId, reportId: newAttachment.reportId }))
      throw TRPCForbidden;

    const id = await useTry(
      async () => (await db.insert(attachments).values(newAttachment).returning({ id: attachments.id }).get()).id,
    );
    const url = await ctl.s3.getStandardUploadPresignedUrl(newAttachment.S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件上传URL' });
    return { id, url };
  }

  async batchMove(
    ids: string[],
    user: TRawUser,
    target: { paperId?: string; reportId?: string },
    replaceOption: { replace: boolean; category?: TAttachmentCategory },
  ) {
    for (const id of ids) {
      const info = await useTry(
        () => db
          .select({
            paperId: attachments.paperId,
            reportId: attachments.reportId,
          })
          .from(attachments)
          .where(eq(attachments.id, id))
          .get(),
      );
      if (!await this.hasPerm(user, { paperId: info?.paperId, reportId: info?.reportId }))
        throw TRPCForbidden;
    }

    if (!(await this.hasPerm(user, target)))
      throw TRPCForbidden;

    if (replaceOption.replace) {
      if (replaceOption.category) {
        if (target.paperId)
          await db.delete(attachments).where(and(eq(attachments.paperId, target.paperId), eq(attachments.category, replaceOption.category)));
        if (target.reportId)
          await db.delete(attachments).where(and(eq(attachments.reportId, target.reportId), eq(attachments.category, replaceOption.category)));
      } else {
        if (target.paperId)
          await db.delete(attachments).where(eq(attachments.paperId, target.paperId));
        if (target.reportId)
          await db.delete(attachments).where(eq(attachments.reportId, target.reportId));
      }
    }

    try {
      await db.update(attachments).set(target).where(inArray(attachments.id, ids));
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法更新附件' });
    }

    return '修改成功';
  }

  async list() {
    const l = await useTry(() => db.select().from(attachments).all());
    return l;
  }

  /**
   * Retrieves the file URL for a given attachment Id without performing permission checks.
   * @param id - The Id of the attachment.
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
   * Retrieves the file URL for a given attachment Id.
   *
   * Will check if the paper is downloadable before returning the URL.
   * If you want to bypass this check, use `getFileUrlUncheckedPerm` instead.
   *
   * @param id - The Id of the attachment.
   * @returns A Promise that resolves to a Result object containing the file URL if successful, or an error Result object if unsuccessful.
   */
  async getFileUrl(id: string, user: TRawUser) {
    const attachment = await useTry(
      () => db
        .select({
          S3FileId: attachments.S3FileId,
          paperId: attachments.paperId,
          reportId: attachments.reportId,
        })
        .from(attachments)
        .where(eq(attachments.id, id))
        .get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法获取附件' },
    );
    if (!attachment || !attachment.S3FileId || (!attachment.paperId && !attachment.reportId))
      throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });

    if (!await this.hasPerm(user, { paperId: attachment.paperId, reportId: attachment.reportId }, true))
      throw new TRPCError({ code: 'FORBIDDEN', message: '无下载权限' });

    const url = await ctl.s3.getFileUrl(attachment.S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件URL' });
    return url;
  }

  /**
   * Cleans up attachments that are pending(i.e. not attached to a paper or report).
   *
   * If `pendingTimeout` is less than or equal to 0, all pending attachments will be deleted.
   *
   * @param pendingTimeout - The timeout in milliseconds to consider an attachment as pending. Defaults to 24 hours.
   */
  async cleanPendingAttachments(pendingTimeout: number = 24 * 60 * 60 * 1000) {
    let attachmentsDeleted;
    if (pendingTimeout <= 0) {
      attachmentsDeleted = await db
        .delete(attachments)
        .where(and(isNull(attachments.paperId), isNull(attachments.reportId)))
        .returning({ S3FileId: attachments.S3FileId });
    } else {
      attachmentsDeleted = await db.delete(attachments).where(
        and(
          isNull(attachments.paperId),
          isNull(attachments.reportId),
          lte(attachments.createdAt, new Date(Date.now() - pendingTimeout)),
        ),
      ).returning({ S3FileId: attachments.S3FileId });
    }

    if (!attachmentsDeleted.length)
      return false;

    for (const attachment of attachmentsDeleted)
      await ctl.s3.deleteFile(attachment.S3FileId);

    return attachmentsDeleted;
  }
}
