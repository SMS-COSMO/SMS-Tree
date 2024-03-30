import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewPaper, TRawPaper, TRawUser } from '../../db/db';
import { papers } from '../../db/schema/paper';
import { paperSerializer } from '../serializer/paper';
import { attachmentSerializer } from '../serializer/attachment';
import { ctl } from '../context';
import { TRPCForbidden, requireTeacherOrThrow, useTry } from '../utils/shared';
import { attachments } from '~/server/db/schema/attachment';
import { usersToGroups } from '~/server/db/schema/userToGroup';

export class PaperController {
  async create(newPaper: TNewPaper) {
    const insertedId = (
      await useTry(
        () => db.insert(papers).values(newPaper).returning({ id: papers.id }).get(),
      )
    ).id;
    return insertedId;
  }

  async createSafe(
    newPaper: Omit<TNewPaper, 'id' | 'isFeatured' | 'isPublic' | 'score' | 'comment' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await useTry(() => db
      .select({ groupId: usersToGroups.groupId })
      .from(usersToGroups)
      .where(eq(usersToGroups.userId, user.id))
      .get(),
    );
    if (!group)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '用户无小组' });

    const insertedId = (
      await useTry(
        () => db
          .insert(papers)
          .values({ ...newPaper, groupId: group.groupId, isPublic: false })
          .returning({ id: papers.id })
          .get(),
      )
    ).id;
    return insertedId;
  }

  async remove(id: string) {
    await useTry(() => db.delete(papers).where(eq(papers.id, id)));
    return '删除成功';
  }

  async getBasicInfo(id: string) {
    const info = await useTry(() => db.select().from(papers).where(eq(papers.id, id)).get());
    return info;
  }

  async getContent(id: string, user: TRawUser, info?: TRawPaper) {
    info ??= await useTry(() => db.select().from(papers).where(eq(papers.id, id)).get());
    if (!info)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const members = await ctl.gc.getMembers(info.groupId);
    const isOwned = await ctl.gc.hasUser(user.id, info.groupId, members);
    if (!info?.isPublic && !isOwned)
      requireTeacherOrThrow(user);

    return paperSerializer(info, members?.members, members?.leader);
  }

  async getListSafe(user: TRawUser) {
    const res = await Promise.all(
      (await useTry(() => db.select().from(papers).where(eq(papers.isPublic, true)).all()))
        .map(async (paper) => {
          return await this.getContent(paper.id, user, paper);
        }),
    );
    return res;
  }

  async getAttachments(id: string, user: TRawUser) {
    const rawPaper = await useTry(
      () => db
        .select({
          groupId: papers.groupId,
          isPublic: papers.isPublic,
          canDownload: papers.canDownload,
        })
        .from(papers)
        .where(eq(papers.id, id))
        .get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
    );
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const isOwned = await ctl.gc.hasUser(user.id, rawPaper.groupId);
    const isAdmin = ['teacher', 'admin'].includes(user.role);
    if (!rawPaper.isPublic && !isOwned)
      requireTeacherOrThrow(user);

    const attachmentList = (isOwned || isAdmin)
      ? await useTry(() => db
        .select().from(attachments)
        .where(eq(attachments.paperId, id)))
      : await useTry(() => db // Students cannot access secondary files
        .select().from(attachments)
        .where(
          and(
            eq(attachments.isMainFile, true),
            eq(attachments.paperId, id),
          ),
        ));

    const res = attachmentList.map(
      x => attachmentSerializer(x, rawPaper.canDownload || isAdmin || isOwned),
    );

    return res;
  }

  // TODO: This seems unsafe
  async updateDownloadCount(id: string, user: TRawUser) {
    const rawPaper = await useTry(
      () => db
        .select({
          groupId: papers.groupId,
          downloadCount: papers.downloadCount,
          canDownload: papers.canDownload,
        })
        .from(papers)
        .where(eq(papers.id, id))
        .get(),
      { code: 'INTERNAL_SERVER_ERROR', message: '附件获取失败' },
    );
    if (!rawPaper)
      throw new TRPCError({ code: 'NOT_FOUND', message: '论文不存在' });

    const isOwned = await ctl.gc.hasUser(user.id, rawPaper.groupId);
    if (rawPaper.canDownload && !isOwned && !['teacher', 'admin'].includes(user.role))
      await useTry(() => db.update(papers).set({ downloadCount: rawPaper.downloadCount + 1 }).where(eq(papers.id, id)));
    else
      throw TRPCForbidden;

    return '修改成功';
  }

  async setComment(id: string, comment: string) {
    await useTry(() => db.update(papers).set({ comment }).where(eq(papers.id, id)));
    return '保存评语成功';
  }

  async setCanDownload(id: string, canDownload: boolean) {
    await useTry(() => db.update(papers).set({ canDownload }).where(eq(papers.id, id)));
    return '修改成功';
  }

  async setIsFeatured(id: string, isFeatured: boolean) {
    await useTry(() => db.update(papers).set({ isFeatured }).where(eq(papers.id, id)));
    return '修改成功';
  }
}
