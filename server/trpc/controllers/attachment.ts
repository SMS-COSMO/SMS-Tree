import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewAttachment, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { ctl } from '../context';
import { TRPCForbidden, makeId } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { allowFileType } from '~/constants/attachment';
import { papers } from '~/server/db/schema/paper';
import { reports } from '~/server/db/schema/report';
import type { TAttachmentCategory } from '~/types';
import { notes } from '~/server/db/schema/note';

export class AttachmentController {
  async hasPerm(
    user: TRawUser,
    id: {
      paperId?: string | undefined | null;
      reportId?: string | undefined | null;
      noteId?: string | undefined | null;
    },
    allowPublic: boolean = false,
  ) {
    // Teachers have all the perm
    if (['teacher', 'admin'].includes(user.role))
      return true;

    // Allowed when attachment is not attached to any paper (needed for paper/report creation)
    if (!id.paperId && !id.reportId && !id.noteId)
      return true;

    if (id.paperId) {
      const paper = await db.query.papers.findFirst({
        where: eq(papers.id, id.paperId),
        columns: {
          canDownload: true,
          isPublic: true,
        },
        with: {
          group: {
            columns: {},
            with: {
              usersToGroups: {
                columns: {},
                with: {
                  user: {
                    columns: { id: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!paper)
        return false;
      // No modify when paper is scored
      if (paper.isPublic)
        return false;
      return (allowPublic && paper.canDownload) || paper.group.usersToGroups.some(x => x.user.id === user.id);
    }

    if (id.reportId) {
      const report = await db.query.reports.findFirst({
        where: eq(reports.id, id.reportId),
        columns: {
          read: true,
        },
        with: {
          group: {
            columns: {},
            with: {
              usersToGroups: {
                columns: {},
                with: {
                  user: {
                    columns: { id: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!report)
        return false;
      // No modify when report is read
      if (report.read)
        return false;
      return allowPublic || report.group.usersToGroups.some(x => x.user.id === user.id);
    }

    if (id.noteId) {
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, id.noteId),
        with: {
          group: {
            columns: {},
            with: {
              usersToGroups: {
                columns: {},
                with: {
                  user: {
                    columns: { id: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!note)
        return false;
      return allowPublic || note.group.usersToGroups.some(x => x.user.id === user.id);
    }
  };

  async create(newAttachment: Omit<TNewAttachment, 'S3FileId'>, user: TRawUser) {
    if (!allowFileType[newAttachment.category].includes(newAttachment.fileType))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '不允许的文件类型' });

    if (!await this.hasPerm(user, {
      paperId: newAttachment.paperId,
      reportId: newAttachment.reportId,
      noteId: newAttachment.noteId,
    })) {
      throw TRPCForbidden;
    }

    const S3FileId = makeId(12);
    const id = (
      await db
        .insert(attachments)
        .values({ ...newAttachment, S3FileId })
        .returning({ id: attachments.id })
        .get()
    ).id;
    const url = await ctl.s3.getStandardUploadPresignedUrl(S3FileId);
    if (!url)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法获取文件上传URL' });
    return { id, url };
  }

  async batchMove(
    ids: string[],
    user: TRawUser,
    target: { paperId?: string; reportId?: string; noteId?: string },
    replaceOption: { replace: boolean; category?: TAttachmentCategory },
  ) {
    if (!['admin', 'teacher'].includes(user.role)) {
      for (const id of ids) {
        const info = await db.query.attachments.findFirst({
          where: eq(attachments.id, id),
          columns: {
            paperId: true,
            reportId: true,
            noteId: true,
          },
          with: {
            paper: {
              columns: {
                canDownload: true,
                isPublic: true,
              },
              with: {
                group: {
                  columns: {},
                  with: {
                    usersToGroups: {
                      columns: {},
                      with: {
                        user: {
                          columns: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            report: {
              columns: { read: true },
              with: {
                group: {
                  columns: {},
                  with: {
                    usersToGroups: {
                      columns: {},
                      with: {
                        user: {
                          columns: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            note: {
              columns: {},
              with: {
                group: {
                  columns: {},
                  with: {
                    usersToGroups: {
                      columns: {},
                      with: {
                        user: {
                          columns: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (!info)
          throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });

        if (info.paperId && info.paper) {
          if (info.paper.isPublic)
            throw new TRPCError({ code: 'NOT_FOUND', message: '提交已截止，不能再修改' });
          if (!info.paper.canDownload && !info.paper.group.usersToGroups.some(x => x.user.id === user.id))
            throw TRPCForbidden;
        } else if (info.reportId && info.report) {
          if (info.report.read)
            throw new TRPCError({ code: 'NOT_FOUND', message: '提交已截止，不能再修改' });
          if (!info.report.group.usersToGroups.some(x => x.user.id === user.id))
            throw TRPCForbidden;
        } else if (info.noteId && info.note) {
          if (!info.note.group.usersToGroups.some(x => x.user.id === user.id))
            throw TRPCForbidden;
        }
      }
    }

    if (!(await this.hasPerm(user, target)))
      throw TRPCForbidden;

    // TODO: use transactions
    if (replaceOption.replace) {
      if (replaceOption.category) {
        if (target.paperId)
          await db.delete(attachments).where(and(eq(attachments.paperId, target.paperId), eq(attachments.category, replaceOption.category)));
        if (target.reportId)
          await db.delete(attachments).where(and(eq(attachments.reportId, target.reportId), eq(attachments.category, replaceOption.category)));
        if (target.noteId)
          await db.delete(attachments).where(and(eq(attachments.noteId, target.noteId), eq(attachments.category, replaceOption.category)));
      } else {
        if (target.paperId)
          await db.delete(attachments).where(eq(attachments.paperId, target.paperId));
        if (target.reportId)
          await db.delete(attachments).where(eq(attachments.reportId, target.reportId));
        if (target.noteId)
          await db.delete(attachments).where(eq(attachments.noteId, target.noteId));
      }
    }
    await db.update(attachments).set(target).where(inArray(attachments.id, ids));

    return '修改成功';
  }

  /**
   * Retrieves the file URL for a given attachment Id without performing permission checks.
   * @param id - The Id of the attachment.
   * @returns A promise that resolves to a Result object containing the file URL if successful, or a Result object with an error message if unsuccessful.
   */
  async getFileUrlUncheckedPerm(id: string) {
    const attachment = await db.query.attachments.findFirst({
      where: eq(attachments.id, id),
      columns: { S3FileId: true },
    });
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
    const attachment = await db.query.attachments.findFirst({
      where: eq(attachments.id, id),
      columns: {
        S3FileId: true,
        paperId: true,
        reportId: true,
        noteId: true,
      },
      with: {
        paper: {
          columns: {
            canDownload: true,
          },
          with: {
            group: {
              columns: {},
              with: {
                usersToGroups: {
                  columns: {},
                  with: {
                    user: {
                      columns: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
        report: {
          columns: {},
          with: {
            group: {
              columns: {},
              with: {
                usersToGroups: {
                  columns: {},
                  with: {
                    user: {
                      columns: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
        note: {
          columns: {},
          with: {
            group: {
              columns: {},
              with: {
                usersToGroups: {
                  columns: {},
                  with: {
                    user: {
                      columns: { id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!attachment)
      throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });

    if (!['admin', 'teacher'].includes(user.role)) {
      if (attachment.paperId && attachment.paper) {
        if (!attachment.paper.canDownload && !attachment.paper.group.usersToGroups.some(x => x.user.id === user.id))
          throw new TRPCError({ code: 'FORBIDDEN', message: '无下载权限' });
      } else if (attachment.reportId && attachment.report) {
        if (!attachment.report.group.usersToGroups.some(x => x.user.id === user.id))
          throw new TRPCError({ code: 'FORBIDDEN', message: '无下载权限' });
      } else if (attachment.noteId && attachment.note) {
        if (!attachment.note.group.usersToGroups.some(x => x.user.id === user.id))
          throw new TRPCError({ code: 'FORBIDDEN', message: '无下载权限' });
      } else {
        throw new TRPCError({ code: 'NOT_FOUND', message: '附件不存在' });
      }
    }

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
        .where(and(isNull(attachments.paperId), isNull(attachments.reportId), isNull(attachments.noteId)))
        .returning({ S3FileId: attachments.S3FileId });
    } else {
      attachmentsDeleted = await db
        .delete(attachments)
        .where(
          and(
            isNull(attachments.paperId),
            isNull(attachments.reportId),
            isNull(attachments.noteId),
            lte(attachments.createdAt, new Date(Date.now() - pendingTimeout)),
          ),
        ).returning({ S3FileId: attachments.S3FileId });
    }

    if (!attachmentsDeleted.length)
      return [];

    for (const attachment of attachmentsDeleted)
      await ctl.s3.deleteFile(attachment.S3FileId);

    return attachmentsDeleted.map(x => x.S3FileId);
  }
}
