import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewNote, TRawNote, TRawUser } from '../../db/db';
import { ctl } from '../context';
import { TRPCForbidden, requireTeacherOrThrow, useTry } from '../utils/shared';
import { noteSerializer } from '../serializer/note';
import { usersToGroups } from '~/server/db/schema/userToGroup';
import { notes } from '~/server/db/schema/note';

export class NoteController {
  async create(newNote: TNewNote) {
    const insertedId = await useTry(
      async () => (await db.insert(notes).values(newNote).returning({ id: notes.id }).get()).id,
    );
    return insertedId;
  }

  async createSafe(
    newNote: Omit<TNewNote, 'id' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await ctl.gc.getUserGroup(user);

    const insertedId = (
      await useTry(
        () => db
          .insert(notes)
          .values({ ...newNote, groupId: group.groupId })
          .returning({ id: notes.id })
          .get(),
      )
    ).id;
    return insertedId;
  }

  async modifySafe(
    newNote: Omit<TRawNote, 'groupId' | 'createdAt'>,
    user: TRawUser,
  ) {
    const group = await ctl.gc.getUserGroup(user);

    await useTry(
      () => db
        .update(notes)
        .set(newNote)
        .where(
          and(
            eq(notes.groupId, group.groupId),
            eq(notes.id, newNote.id),
          ),
        ),
    );
    return '创建成功';
  }

  async remove(id: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      const { groupId } = await useTry(
        () => db.select({ groupId: notes.groupId }).from(notes).where(eq(notes.id, id)).get(),
      )
      ?? {};

      if (!groupId || !await ctl.gc.hasUser(user.id, groupId))
        throw TRPCForbidden;
    }

    await useTry(() => db.delete(notes).where(eq(notes.id, id)));
    return '删除成功';
  }

  async getContent(id: string, user: TRawUser, info?: TRawNote) {
    info ??= await useTry(() => db.select().from(notes).where(eq(notes.id, id)).get());
    if (!info)
      throw new TRPCError({ code: 'NOT_FOUND', message: '活动记录不存在' });

    const members = await ctl.gc.getMembers(info.groupId);
    const isOwned = await ctl.gc.hasUser(user.id, info.groupId, members);
    if (!isOwned)
      requireTeacherOrThrow(user);

    return noteSerializer(info, members?.members, members?.leader);
  }
}
