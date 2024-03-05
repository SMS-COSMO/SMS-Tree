import { and, eq, inArray } from 'drizzle-orm';
import { LibsqlError } from '@libsql/client';
import type { TNewGroup, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { groups } from '../../db/schema/group';
import type { TGroup } from '../serializer/group';
import { groupSerializer } from '../serializer/group';
import { usersToGroups } from '../../db/schema/userToGroup';
import { papersToGroups } from '../../db/schema/paperToGroup';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { requireEqualOrThrow } from '../utils/shared';

export class GroupController {
  async create(newGroup: TNewGroup & {
    members?: string[];
    papers?: string[];
  }) {
    const { members, papers, ...group } = newGroup;
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

    try {
      if (papers?.length) {
        await db.insert(papersToGroups).values(papers.map(item => ({
          groupId: insertedId,
          paperId: item,
        })));
      }
    } catch (err) {
      return new ResultNoRes(false, '论文不存在');
    }

    return new ResultNoRes(true, '创建成功');
  }

  async remove(id: string) {
    try {
      await Promise.all([
        db.delete(usersToGroups).where(eq(usersToGroups.groupId, id)),
        db.delete(papersToGroups).where(eq(papersToGroups.groupId, id)),
      ]);
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

  async getContent(id: string) {
    try {
      const info = await db.select().from(groups).where(eq(groups.id, id)).get();
      if (!info)
        return new ResultNoRes(false, '小组不存在');

      const members = (
        await db.select().from(usersToGroups)
          .where(eq(usersToGroups.groupId, id))
      ).map(item => item.userId);

      const papers = (
        await db.select().from(papersToGroups)
          .where(eq(papersToGroups.groupId, id))
      ).map(item => item.paperId);

      const group = groupSerializer(info, members, papers);
      return new Result(true, '查询成功', group);
    } catch (err) {
      return new ResultNoRes(false, '小组不存在');
    }
  }

  async projectName(groupIds: string[]) {
    try {
      if (!groupIds.length)
        return new Result(true, '查询成功', '');
      const projectNames = (await db.select({ projectName: groups.projectName }).from(groups).where(inArray(groups.id, groupIds))).map(n => n.projectName);
      const res = projectNames.reduce((a, c) => `${a}《${c}》`, '');
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async getList(classId?: string) {
    try {
      const res: Array<TGroup> = [];
      for (const info of
        classId
          ? await db.select().from(groups).where(eq(groups.classId, classId))
          : await db.select().from(groups).all()
      ) {
        const members = (
          await db.select().from(usersToGroups)
            .where(eq(usersToGroups.groupId, info.id))
        ).map(item => item.userId);

        const papers = (
          await db.select().from(papersToGroups)
            .where(eq(papersToGroups.groupId, info.id))
        ).map(item => item.paperId);

        res.push(groupSerializer(info, members, papers));
      }

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
      await db.delete(usersToGroups).where(and(
        eq(usersToGroups.userId, userId),
        eq(usersToGroups.groupId, groupId),
      ));
      return new ResultNoRes(true, '退出成功');
    } catch (err) {
      return new Result500();
    }
  }

  async changeGroup(userId: string, oldGroupId: string, newGroupId: string) {
    try {
      await db.update(usersToGroups).set({ groupId: newGroupId }).where(and(
        eq(usersToGroups.userId, userId),
        eq(usersToGroups.groupId, oldGroupId),
      ));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }

  async setLeader(userId: string, groupId: string, user: TRawUser) {
    requireEqualOrThrow(userId, user?.id, '只能将自己设为组长', 'FORBIDDEN');
    try {
      await db.update(groups).set({ leader: userId }).where(eq(groups.id, groupId));
      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      return new Result500();
    }
  }
}
