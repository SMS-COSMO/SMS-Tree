import { and, eq, inArray, sql } from 'drizzle-orm';
import { LibsqlError } from '@libsql/client';
import { TRPCError } from '@trpc/server';
import type { TNewGroup, TRawGroup, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { groups } from '../../db/schema/group';
import { groupSerializer } from '../serializer/group';
import { usersToGroups } from '../../db/schema/userToGroup';
import { TRPCForbidden, requireEqualOrThrow, useTry } from '../utils/shared';
import { ctl } from '../context';
import type { TMinimalUser } from '../serializer/paper';
import { papers } from '~/server/db/schema/paper';
import { users } from '~/server/db/schema/user';
import { notes } from '~/server/db/schema/note';
import { reports } from '~/server/db/schema/report';

export class GroupController {
  async create(newGroup: TNewGroup & { members?: string[] }) {
    const { members, ...group } = newGroup;
    group.archived = group.archived ?? false;

    const insertedId = await useTry(
      async () => (await db.insert(groups).values(group).returning({ id: groups.id }).get()).id,
    );

    if (members) {
      await useTry(
        () =>
          db.insert(usersToGroups).values(members.map(item => ({
            groupId: insertedId,
            userId: item,
          }))),
      );
    }

    return '创建成功';
  }

  async remove(id: string) {
    try {
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, id));
      await db.delete(groups).where(eq(groups.id, id));
      return '删除成功';
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }
  }

  async modifyMembers(groupId: string, newMembers: string[], newLeader: string) {
    if (!newMembers.includes(newLeader))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '组长需要包含于组员中' });
    if (!(await db.select().from(groups).where(eq(groups.id, groupId))).length)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '小组id不存在' });

    try {
      await db.update(groups).set({ leader: newLeader }).where(eq(groups.id, groupId));
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, groupId));

      await Promise.all(newMembers.map(userId => db.insert(usersToGroups).values({ userId, groupId })));
      return '修改成功';
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY')
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '用户id不存在' });
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '修改失败' });
    }
  }

  async modifyProjectName(groupId: string, newProjectName: string, user: TRawUser) {
    if (!['teacher', 'admin'].includes(user.role) && !(await this.hasUser(user.id, groupId)))
      throw TRPCForbidden;

    await useTry(
      () => db.update(groups).set({ projectName: newProjectName }).where(eq(groups.id, groupId)),
    );
    return '修改成功';
  }

  PLeader = db.select({ leader: groups.leader }).from(groups).where(eq(groups.id, sql.placeholder('groupId'))).prepare();
  PRawMembers = db.select({ userId: usersToGroups.userId }).from(usersToGroups).where(eq(usersToGroups.groupId, sql.placeholder('id'))).prepare();
  PMemberUsername = db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, sql.placeholder('id'))).prepare();

  async getMembers(id: string, leaderId?: string | null) {
    leaderId ??= await useTry(async () => (await this.PLeader.get({ groupId: id }))?.leader);
    const rawMembers = await useTry(() => this.PRawMembers.all({ id }));
    const members = await Promise.all(
      rawMembers.map(
        async item => await useTry(
          () => this.PMemberUsername.get({ id: item.userId }),
        ),
      ),
    );
    const leader = await useTry(
      async () => leaderId
        ? await this.PMemberUsername.get({ id: leaderId })
        : undefined,
    );
    return { members, leader };
  }

  async getContent(id: string, user: TRawUser, getDetail: boolean, info?: TRawGroup) {
    info ??= await useTry(() => db.select().from(groups).where(eq(groups.id, id)).get());
    if (!info)
      throw new TRPCError({ code: 'NOT_FOUND', message: '小组不存在' });

    const { members, leader } = await this.getMembers(info.id, info.leader);
    const isOwned = await this.hasUser(user.id, id, { members, leader });

    let papersWithInfo, reportsWithInfo;
    if (getDetail) {
      const rawPapers = await useTry(() => db.select().from(papers).where(eq(papers.groupId, id)));
      papersWithInfo = await Promise.all(
        rawPapers.map(
          async item => await ctl.pc.getContent(item.id, user, item),
        ),
      );
      const rawReports = await useTry(() => db.select().from(reports).where(eq(reports.groupId, id)));
      reportsWithInfo = await Promise.all(
        rawReports.map(
          async item => await ctl.rc.getContent(item.id, user, item),
        ),
      );
    }

    let rawNotes;
    if (isOwned)
      rawNotes = await useTry(() => db.select().from(notes).where(eq(notes.groupId, id)));

    return groupSerializer(info, members, leader, papersWithInfo, rawNotes, reportsWithInfo);
  }

  async projectName(groupIds: string[]) {
    if (!groupIds.length)
      return '';
    const projectNames = await useTry(
      async () => (
        await db
          .select({ projectName: groups.projectName })
          .from(groups)
          .where(
            and(
              inArray(groups.id, groupIds),
              eq(groups.archived, false),
            ),
          )
      ).map(n => n.projectName),
    );
    return projectNames.reduce((a, c) => `${a}《${c}》`, '');
  }

  async getList(user: TRawUser, classId?: string) {
    // Allow admins to leave classId empty
    if (!classId && !['teacher', 'admin'].includes(user.role))
      throw TRPCForbidden;

    if (classId) {
      const classInfo = await ctl.cc.getFullContent(classId);
      if (!['teacher', 'admin'].includes(user.role) && !classInfo.students.includes(user.id))
        throw TRPCForbidden;
    }

    const groupList = classId
      ? await useTry(() => db.select().from(groups).where(eq(groups.classId, classId)))
      : await useTry(() => db.select().from(groups).all());

    const res = await Promise.all(
      groupList.map(async info => await this.getContent(info.id, user, false, info)),
    );

    return res;
  }

  async joinGroup(userId: string, groupId: string) {
    try {
      await db.insert(usersToGroups).values({ userId, groupId });
      return '加入成功';
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        throw new TRPCError({ code: 'BAD_REQUEST', message: '已加入，请勿重复加入' });
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法加入小组' });
    }
  }

  async leaveGroup(userId: string, groupId: string) {
    await useTry(
      () => db.delete(usersToGroups).where(
        and(
          eq(usersToGroups.userId, userId),
          eq(usersToGroups.groupId, groupId),
        ),
      ),
    );

    await this._removeIfLeaderLeaves(userId, groupId);
    return '退出成功';
  }

  async changeGroup(userId: string, oldGroupId: string, newGroupId: string) {
    await useTry(
      () => db.update(usersToGroups).set({ groupId: newGroupId }).where(
        and(
          eq(usersToGroups.userId, userId),
          eq(usersToGroups.groupId, oldGroupId),
        ),
      ),
    );

    await this._removeIfLeaderLeaves(userId, oldGroupId);
    return '修改成功';
  }

  async _setLeader(userId: string, groupId: string) {
    await useTry(() => db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId)));
    return '修改成功';
  }

  /**
   * Sets the group leader safely.
   *
   * If the user is not an **admin** or **teacher**, the user can only set themselves as the leader.
   * Admins and teachers can set any user as leader.
   *
   * If you want to set the leader without checking the user's role, use `_setLeader` instead.
   *
   * @param userId The user Id.
   * @param groupId The group Id.
   * @param user The user performing the action.
   */
  async setLeader(userId: string, groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role))
      requireEqualOrThrow(userId, user.id, { message: '只能将自己设为组长', code: 'FORBIDDEN' });

    await useTry(() => db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId)));
    return '修改成功';
  }

  async _removeLeader(groupId: string) {
    await useTry(() => db.update(groups).set({ leader: null }).where(eq(groups.id, groupId)));
    return '修改成功';
  }

  /**
   * Removes the leader safely from a group.
   *
   * If the user is not an **admin** or **teacher**, the user can only remove themselves from the leader position.
   * Admins and teachers can remove any user from the leader position.
   *
   * If you want to remove the leader without checking the user's role, use `_removeLeader` instead.
   *
   * @param groupId - The Id of the group.
   * @param user - The user performing the action.
   */
  async removeLeader(groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      requireEqualOrThrow(
        user.id,
        await useTry(
          async () => (await this.PLeader.get({ groupId }))?.leader,
        ),
        { message: '只能将自己移出组长', code: 'FORBIDDEN' },
      );
    }

    await useTry(() => db.update(groups).set({ leader: null }).where(eq(groups.id, groupId)));
    return '修改成功';
  }

  /**
   * Removes the leader from a group if the leader leaves.
   * @param {string} userId - The Id of the user who left the group.
   * @param {string} groupId - The Id of the group.
   */
  private async _removeIfLeaderLeaves(userId: string, groupId: string) {
    try {
      const group = await this.PLeader.get({ groupId });
      if (group?.leader === userId)
        await this._removeLeader(groupId);
    } catch (err) {
      // swallow
    }
  }

  async hasUser(
    userId: string,
    groupId: string,
    members?: {
      members: TMinimalUser[];
      leader: TMinimalUser;
    },
  ) {
    try {
      members ??= await this.getMembers(groupId);
      if (members.members)
        return members.members.some(x => x?.id === userId);
      return false;
    } catch (err) {
      return false;
    }
  }

  async getUserGroup(user: TRawUser) {
    const group = await useTry(
      () => db
        .select({ groupId: usersToGroups.groupId })
        .from(usersToGroups)
        .where(eq(usersToGroups.userId, user.id))
        .get(),
    );
    if (!group)
      throw new TRPCError({ message: '用户无小组', code: 'FORBIDDEN' });
    return group;
  }
}
