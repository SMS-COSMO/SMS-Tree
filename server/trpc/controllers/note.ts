import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import type { TNewNote, TRawNote, TRawUser } from '../../db/db';
import { TRPCForbidden } from '../utils/shared';
import { notes } from '~/server/db/schema/note';
import { usersToGroups } from '~/server/db/schema/userToGroup';

export class NoteController {
  async create(newNote: TNewNote) {
    return (await db.insert(notes).values(newNote).returning({ id: notes.id }).get()).id;
  }

  async createSafe(
    newNote: Omit<TNewNote, 'id' | 'groupId'>,
    user: TRawUser,
  ) {
    const group = await db.query.usersToGroups.findFirst({
      where: eq(usersToGroups.userId, user.id),
      columns: { groupId: true },
    });
    if (!group)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户无小组' });

    const insertedId = (
      await db
        .insert(notes)
        .values({ ...newNote, groupId: group.groupId })
        .returning({ id: notes.id })
        .get()
    ).id;
    return insertedId;
  }

  async modifySafe(
    newNote: Omit<TRawNote, 'groupId' | 'createdAt'>,
    user: TRawUser,
  ) {
    const group = await db.query.usersToGroups.findFirst({
      where: eq(usersToGroups.userId, user.id),
      columns: { groupId: true },
    });
    if (!group)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户无小组' });

    await db
      .update(notes)
      .set(newNote)
      .where(
        and(
          eq(notes.groupId, group.groupId),
          eq(notes.id, newNote.id),
        ),
      );
    return '创建成功';
  }

  async remove(id: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      const note = await db.query.notes.findFirst({
        where: eq(notes.id, id),
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
      });
      if (!note)
        throw new TRPCError({ code: 'NOT_FOUND', message: '活动记录不存在' });
      if (!note.group.usersToGroups.some(x => x.user.id === user.id))
        throw TRPCForbidden;
    }

    await db.delete(notes).where(eq(notes.id, id));
    return '删除成功';
  }
}
