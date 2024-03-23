import { and, eq, inArray } from 'drizzle-orm';
import { LibsqlError } from '@libsql/client';
import type { TNewGroup, TRawGroup, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { groups } from '../../db/schema/group';
import type { TGroup } from '../serializer/group';
import { groupSerializer } from '../serializer/group';
import { usersToGroups } from '../../db/schema/userToGroup';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { requireEqualOrThrow } from '../utils/shared';
import { ctl } from '../context';
import { papers } from '~/server/db/schema/paper';
import { users } from '~/server/db/schema/user';

export class GroupController {
  async create(newGroup: TNewGroup & {
    members?: string[];
  }) {
    const { members, ...group } = newGroup;
    group.archived = group.archived ?? false;

    let insertedId: string;
    try {
      insertedId = (await db.insert(groups).values(group).returning({ id: groups.id }).get()).id;
    } catch (err) {
      return new Result500();
    }

    try {
      await db.insert(usersToGroups).values((members ?? []).map(item => ({
        groupId: insertedId,
        userId: item,
      })));
    } catch (err) {
      return new ResultNoRes(false, '用户不存在');
    }

    return new ResultNoRes(true, '创建成功');
  }

  async remove(id: string) {
    try {
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, id));
      await db.delete(groups).where(eq(groups.id, id));
      return new ResultNoRes(true, '删除成功');
    } catch (err) {
      return new ResultNoRes(false, '小组不存在');
    }
  }

  async modifyMembers(groupId: string, newMembers: string[], newLeader: string) {
    if (!newMembers.includes(newLeader))
      return new ResultNoRes(false, '组长需要包含于组员中');
    if (!(await db.select().from(groups).where(eq(groups.id, groupId))).length)
      return new ResultNoRes(false, '小组id不存在');

    try {
      await db.update(groups).set({ leader: newLeader }).where(eq(groups.id, groupId));
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, groupId));

      await Promise.all(newMembers.map(userId => db.insert(usersToGroups).values({ userId, groupId })));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY')
        return new ResultNoRes(false, '用户id不存在');
      return new Result500();
    }
  }

  async getMembers(id: string, leaderId?: string | null) {
    try {
      leaderId ??= (await db.select({ l: groups.leader }).from(groups).where(eq(groups.id, id)).get())?.l;

      const rawMembers = await db.select({ userId: usersToGroups.userId }).from(usersToGroups).where(eq(usersToGroups.groupId, id)).all();
      const members = await Promise.all(
        rawMembers.map(
          async item => await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, item.userId)).get(),
        ),
      );

      const leader = leaderId
        ? await db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, leaderId)).get()
        : undefined;
      return new Result(true, '查询成功', { members, leader });
    } catch (err) {
      return new ResultNoRes(false, '小组不存在');
    }
  }

  async getContent(id: string, user: TRawUser, info?: TRawGroup) {
    try {
      info ??= await db.select().from(groups).where(eq(groups.id, id)).get();
      if (!info)
        return new ResultNoRes(false, '小组不存在');

      const rawPapers = await db.select().from(papers).where(eq(papers.groupId, id));
      const papersWithInfo = await Promise.all(
        rawPapers.map(
          async item => (await ctl.pc.getContent(item.id, user, item)).getResOrTRPCError('INTERNAL_SERVER_ERROR'),
        ),
      );

      const { members, leader } = (await this.getMembers(info.id, info.leader)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      const group = groupSerializer(info, papersWithInfo, members, leader);
      return new Result(true, '查询成功', group);
    } catch (err) {
      return new ResultNoRes(false, '小组不存在');
    }
  }

  async projectName(groupIds: string[]) {
    try {
      if (!groupIds.length)
        return new Result(true, '查询成功', '');
      const projectNames = (
        await db
          .select({ projectName: groups.projectName })
          .from(groups)
          .where(inArray(groups.id, groupIds))
      ).map(n => n.projectName);
      const res = projectNames.reduce((a, c) => `${a}《${c}》`, '');
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async getList(user: TRawUser, classId?: string) {
    try {
      const res: Array<TGroup> = [];
      for (const info of
        classId
          ? await db.select().from(groups).where(eq(groups.classId, classId))
          : await db.select().from(groups).all()
      )
        res.push((await this.getContent(info.id, user, info)).getResOrTRPCError('INTERNAL_SERVER_ERROR'));

      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async joinGroup(userId: string, groupId: string) {
    try {
      await db.insert(usersToGroups).values({ userId, groupId });
      return new ResultNoRes(true, '加入成功');
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        return new ResultNoRes(false, '已加入，请勿重复加入');
      return new Result500();
    }
  }

  async leaveGroup(userId: string, groupId: string) {
    try {
      await db.delete(usersToGroups).where(
        and(
          eq(usersToGroups.userId, userId),
          eq(usersToGroups.groupId, groupId),
        ),
      );

      await this._removeIfLeaderLeaves(userId, groupId);
      return new ResultNoRes(true, '退出成功');
    } catch (err) {
      return new Result500();
    }
  }

  async changeGroup(userId: string, oldGroupId: string, newGroupId: string) {
    try {
      await db.update(usersToGroups).set({ groupId: newGroupId }).where(
        and(
          eq(usersToGroups.userId, userId),
          eq(usersToGroups.groupId, oldGroupId),
        ),
      );

      await this._removeIfLeaderLeaves(userId, oldGroupId);

      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  async _setLeader(userId: string, groupId: string) {
    try {
      await db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  /**
   * Sets the group leader safely.
   *
   * If the user is not an **admin** or **teacher**, the user can only set themselves as the leader.
   * Admins and teachers can set any user as leader.
   *
   * If you want to set the leader without checking the user's role, use `_setLeader` instead.
   *
   * @param userId The user ID.
   * @param groupId The group ID.
   * @param user The user performing the action.
   */
  async setLeader(userId: string, groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role))
      requireEqualOrThrow(userId, user.id, '只能将自己设为组长', 'FORBIDDEN');

    try {
      await db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  async _removeLeader(groupId: string) {
    try {
      await db.update(groups).set({ leader: null }).where(eq(groups.id, groupId));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  /**
   * Removes the leader safely from a group.
   *
   * If the user is not an **admin** or **teacher**, the user can only remove themselves from the leader position.
   * Admins and teachers can remove any user from the leader position.
   *
   * If you want to remove the leader without checking the user's role, use `_removeLeader` instead.
   *
   * @param groupId - The ID of the group.
   * @param user - The user performing the action.
   */
  async removeLeader(groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role)) {
      requireEqualOrThrow(
        user.id,
        (await db.select({ leader: groups.leader }).from(groups).where(eq(groups.id, groupId)).get())?.leader,
        '只能将自己移出组长',
        'FORBIDDEN',
      );
    }
    try {
      await db.update(groups).set({ leader: null }).where(eq(groups.id, groupId));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  /**
   * Removes the leader from a group if the leader leaves.
   * @param {string} userId - The ID of the user who left the group.
   * @param {string} groupId - The ID of the group.
   */
  private async _removeIfLeaderLeaves(userId: string, groupId: string) {
    try {
      const group = (await db.select({ leader: groups.leader }).from(groups).where(eq(groups.id, groupId)).get());
      if (group?.leader === userId)
        await this._removeLeader(groupId);
    } catch (err) {
      // swallow
    }
  }
}
