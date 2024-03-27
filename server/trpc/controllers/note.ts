import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewNote, TRawNote, TRawUser } from '../../db/db';

import { ctl } from '../context';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { requireTeacherOrThrow } from '../utils/shared';
import { noteSerializer } from '../serializer/note';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { notes } from '~/server/db/schema/note';

export class NoteController {
  async create(newNote: TNewNote) {
    try {
      const insertedId = (await db.insert(notes).values(newNote).returning({ id: notes.id }).get()).id;
      return new Result(true, '创建成功', insertedId);
    } catch (err) {
      return new Result500();
    }
  }

  async getUserGroup(user: TRawUser) {
    let group;
    try {
      group = (
        await db
          .select({ groupId: usersToGroups.groupId })
          .from(usersToGroups)
          .where(eq(usersToGroups.userId, user.id))
          .get()
      );
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }
    if (!group)
      throw new TRPCError({ message: '用户无小组', code: 'UNAUTHORIZED' });
    return group;
  }

  async createSafe(
    newNote: Omit<TNewNote, 'id' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await this.getUserGroup(user);

    try {
      const insertedId = (
        await db
          .insert(notes)
          .values({ ...newNote, groupId: group.groupId })
          .returning({ id: notes.id })
          .get()
      ).id;
      return new Result(true, '创建成功', insertedId);
    } catch (err) {
      return new Result500();
    }
  }

  async modifySafe(
    newNote: Omit<TRawNote, 'groupId'>,
    user: TRawUser,
  ) {
    const group = await this.getUserGroup(user);

    try {
      await db
        .update(notes)
        .set(newNote)
        .where(
          and(
            eq(notes.groupId, group.groupId),
            eq(notes.id, newNote.id),
          ),
        );
      return new ResultNoRes(true, '创建成功');
    } catch (err) {
      return new Result500();
    }
  }

  async remove(id: string, user: TRawUser) {
    try {
      if (!['admin', 'teacher'].includes(user.role)) {
        const { groupId } = await db.select({ groupId: notes.groupId }).from(notes).where(eq(notes.id, id)).get() ?? {};
        if (!groupId || !await ctl.gc.hasUser(user.id, groupId))
          return new ResultNoRes(false, '超出权限范围');
      }

      await db.delete(notes).where(eq(notes.id, id));
      return new ResultNoRes(true, '删除成功');
    } catch (err) {
      return new ResultNoRes(false, '活动记录不存在');
    }
  }

  async getContent(id: string, user: TRawUser, info?: TRawNote) {
    try {
      info ??= await db.select().from(notes).where(eq(notes.id, id)).get();
      if (!info)
        return new ResultNoRes(false, '活动记录不存在');

      const members = (await ctl.gc.getMembers(info.groupId)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      const isOwned = await ctl.gc.hasUser(user.id, info.groupId, members);
      if (!isOwned)
        requireTeacherOrThrow(user);

      return new Result(true, '查询成功', noteSerializer(info, members?.members, members?.leader));
    } catch (err) {
      return new ResultNoRes(false, '活动记录不存在');
    }
  }
}
