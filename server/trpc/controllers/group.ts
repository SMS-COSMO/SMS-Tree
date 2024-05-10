import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewGroup, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { groups } from '../../db/schema/group';
import { usersToGroups } from '../../db/schema/userToGroup';
import { TRPCForbidden } from '../utils/shared';
import { classes } from '~/server/db/schema/class';

export class GroupController {
  async create(newGroup: TNewGroup & { members?: string[] }) {
    const { members, ...group } = newGroup;
    group.archived = group.archived ?? false;

    const insertedId = (await db.insert(groups).values(group).returning({ id: groups.id }).get()).id;
    if (members) {
      await db.insert(usersToGroups).values(
        members.map(item => ({
          groupId: insertedId,
          userId: item,
        })),
      );
    }

    return '创建成功';
  }

  async remove(id: string) {
    await db.delete(groups).where(eq(groups.id, id));
    return '删除成功';
  }

  async modifyProjectName(groupId: string, newProjectName: string, user: TRawUser) {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
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
    });
    if (!group)
      throw new TRPCError({ code: 'NOT_FOUND', message: '小组不存在' });
    if (!['teacher', 'admin'].includes(user.role) && !group.usersToGroups.some(x => x.user.id === user.id))
      throw TRPCForbidden;

    await db.update(groups).set({ projectName: newProjectName }).where(eq(groups.id, groupId));
    return '修改成功';
  }

  async info(id: string, user: TRawUser) {
    const res = await db.query.groups.findFirst({
      where: eq(groups.id, id),
      with: {
        notes: true,
        reports: {
          with: {
            attachments: {
              columns: {
                category: true,
                createdAt: true,
                fileType: true,
                id: true,
                name: true,
                S3FileId: true,
              },
            },
          },
        },
        paper: {
          columns: {
            id: true,
            canDownload: true,
            category: true,
            createdAt: true,
            downloadCount: true,
            isFeatured: true,
            score: true,
            title: true,
          },
        },
        usersToGroups: {
          columns: {},
          with: {
            user: {
              columns: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '小组不存在' });

    if (!['admin', 'teacher'].includes(user.role) && !res.usersToGroups.some(x => x.user.id === user.id)) {
      res.notes = [];
      res.paper = null;
      res.reports = [];
      res.projectName = '';
      res.classId = '';
    }

    const { usersToGroups, leader: _, ...info } = res;
    const members = usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
    return {
      members,
      leader: members.find(x => x.id === res.leader),
      ...info,
    };
  }

  async listFull(classId?: string) {
    const res = await db.query.groups.findMany({
      where: classId ? eq(groups.classId, classId) : undefined,
      with: {
        notes: true,
        reports: {
          with: {
            attachments: {
              columns: {
                category: true,
                createdAt: true,
                fileType: true,
                id: true,
                name: true,
                S3FileId: true,
              },
            },
          },
        },
        paper: {
          columns: {
            id: true,
            canDownload: true,
            category: true,
            createdAt: true,
            downloadCount: true,
            isFeatured: true,
            score: true,
            title: true,
          },
        },
        usersToGroups: {
          columns: {},
          with: {
            user: {
              columns: {
                id: true,
                username: true,
                schoolId: true,
              },
            },
          },
        },
      },
    });

    return res.map((group) => {
      const { usersToGroups, leader: _, ...info } = group;
      const members = usersToGroups.map(u => u.user);
      return {
        members,
        leader: members.find(x => x.id === group.leader),
        ...info,
      };
    });
  }

  async list(user: TRawUser, classId?: string) {
    if (!['teacher', 'admin'].includes(user.role)) {
      // Only admins are allowed to leave classId empty
      if (!classId)
        throw TRPCForbidden;

      const classInfo = await db.query.classes.findFirst({
        where: eq(classes.id, classId),
        columns: {},
        with: {
          classesToStudents: {
            columns: { userId: true },
          },
        },
      });
      if (!classInfo || !classInfo.classesToStudents.some(x => x.userId === user.id))
        throw TRPCForbidden;
    }

    const res = await db.query.groups.findMany({
      where: classId ? eq(groups.classId, classId) : undefined,
      with: {
        usersToGroups: {
          columns: {},
          with: {
            user: {
              columns: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return res.map((group) => {
      const { usersToGroups, leader: _, ...info } = group;
      const members = usersToGroups.map(u => ({ id: u.user.id, username: u.user.username }));
      return {
        members,
        leader: members.find(x => x.id === group.leader),
        ...info,
      };
    });
  }

  async joinGroup(userId: string, groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role) && userId !== user.id)
      throw TRPCForbidden;

    await db.insert(usersToGroups).values({ userId, groupId });
    return '加入成功';
  }

  async leaveGroup(userId: string, groupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role) && userId !== user.id)
      throw TRPCForbidden;
    await db.delete(usersToGroups).where(
      and(
        eq(usersToGroups.userId, userId),
        eq(usersToGroups.groupId, groupId),
      ),
    );
    await this._removeIfLeaderLeaves(userId, groupId);
    return '退出成功';
  }

  async changeGroup(userId: string, oldGroupId: string, newGroupId: string, user: TRawUser) {
    if (!['admin', 'teacher'].includes(user.role) && userId !== user.id)
      throw TRPCForbidden;
    await db.update(usersToGroups).set({ groupId: newGroupId }).where(
      and(
        eq(usersToGroups.userId, userId),
        eq(usersToGroups.groupId, oldGroupId),
      ),
    );
    await this._removeIfLeaderLeaves(userId, oldGroupId);
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
    if (!['admin', 'teacher'].includes(user.role)) {
      if (userId !== user.id)
        throw new TRPCError({ code: 'FORBIDDEN', message: '只能将自己设为组长' });
    }

    await db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId));
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
      const leaderId = (await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
        columns: { leader: true },
      }))?.leader;
      if (user.id !== leaderId)
        throw new TRPCError({ code: 'FORBIDDEN', message: '只能将自己移出组长' });
    }

    await db.update(groups).set({ leader: null }).where(eq(groups.id, groupId));
    return '修改成功';
  }

  /**
   * Removes the leader from a group if the leader leaves.
   * @param {string} userId - The Id of the user who left the group.
   * @param {string} groupId - The Id of the group.
   */
  private async _removeIfLeaderLeaves(userId: string, groupId: string) {
    try {
      const group = await db.query.groups.findFirst({
        where: eq(groups.id, groupId),
        columns: { leader: true },
      });
      if (group?.leader === userId)
        await db.update(groups).set({ leader: null }).where(eq(groups.id, groupId));
    } catch (err) {
      // swallow
    }
  }
}
