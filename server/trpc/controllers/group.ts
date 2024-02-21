import { eq, inArray } from 'drizzle-orm';
import { LibsqlError } from '@libsql/client';
import type { TNewGroup } from '../../db/db';
import { db } from '../../db/db';
import { groups } from '../../db/schema/group';
import type { TGroup } from '../serializer/group';
import { groupSerializer } from '../serializer/group';
import { usersToGroups } from '../../db/schema/userToGroup';
import { papersToGroups } from '../../db/schema/paperToGroup';
import { Result, Result500, ResultNoRes } from '../utils/result';

export class GroupController {
  async create(newGroup: TNewGroup & {
    members?: string[];
    papers?: string[];
  }) {
    const { members, papers, ...group } = newGroup;
    group.archived = group.archived ?? false;

    let insertedId: string;
    try {
      insertedId = (await db.insert(groups).values(group).returning({ id: groups.id }))[0].id;
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
      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, id));
      await db.delete(papersToGroups).where(eq(papersToGroups.groupId, id));
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
      for (const userId of newMembers)
        await db.insert(usersToGroups).values({ userId, groupId });

      return new ResultNoRes(true, '修改成功');
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY')
        return new ResultNoRes(false, '用户id不存在');
      return new Result500();
    }
  }

  async getContent(id: string) {
    try {
      const info = (await db.select().from(groups).where(eq(groups.id, id)))[0];

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

  async getList() {
    try {
      const res: Array<TGroup> = [];
      for (const info of await db.select().from(groups)) {
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
}
