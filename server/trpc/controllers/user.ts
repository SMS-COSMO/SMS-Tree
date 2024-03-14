import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { refreshTokens, users } from '../../db/schema/user';
import { type TUser, userSerializer } from '../serializer/user';
import { usersToGroups } from '../../db/schema/userToGroup';
import { classesToUsers } from '../../db/schema/classToUser';
import { ctl } from '../context';
import { Auth } from '../utils/auth';
import { Result, Result500, ResultNoRes } from '../utils/result';
import { makeId } from '../../trpc/utils/shared';

export class UserController {
  private auth: Auth;
  constructor() {
    this.auth = new Auth();
  }

  async getUserFromHeader(req: CreateExpressContextOptions['req']) {
    if (!req.headers.authorization)
      return undefined;
    const result = await this.auth.getUserFromToken(req.headers.authorization);
    if (result.err)
      return undefined;
    return result.user;
  }

  async register(newUser: TNewUser & { groupIds?: string[] }) {
    const { id, username, password, role, groupIds } = newUser;
    const hash = await bcrypt.hash(password, 8);
    const user = { id, username, password: hash, role };
    try {
      const insertedId = (await db.insert(users).values(user).returning({ id: users.id }).get()).id;
      if (groupIds?.length) {
        await db.insert(usersToGroups).values(
          groupIds.map(item => ({
            userId: insertedId,
            groupId: item,
          })),
        );
      }
      return new ResultNoRes(true, '注册成功');
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        return new ResultNoRes(false, '用户ID出现重复');
      else return new Result500();
    }
  }

  async bulkRegister(inputUsers: { id: string; username: string }[], randomPassword?: boolean) {
    if ((new Set(inputUsers.map(user => user.id))).size !== inputUsers.length)
      return new ResultNoRes(false, '用户ID出现重复');

    for (const user of inputUsers) {
      if ((await db.select().from(users).where(eq(users.id, user.id))).length > 0)
        return new ResultNoRes(false, '用户ID出现重复');
    }

    const newUsers = await Promise.all(inputUsers.map(async ({ id, username }) => {
      const password = randomPassword ? await bcrypt.hash(makeId(12), 8) : await bcrypt.hash(id, 8);
      return {
        id,
        role: 'student',
        password,
        username,
        groupIds: [],
      } as TNewUser & { groupIds: string[] };
    }));
    await db.insert(users).values(newUsers);
    return new ResultNoRes(true, '创建成功');
  }

  async modifyPassword(user: TRawUser, id: string, oldPassword: string, newPassword: string) {
    if (!['admin', 'teacher'].includes(user.role) && user.id !== id)
      return new ResultNoRes(false, '无修改权限');

    const targetUser = user.id === id ? user : await db.select().from(users).where(eq(users.id, id)).get();
    if (!targetUser)
      return new ResultNoRes(false, '用户不存在');

    if (newPassword === oldPassword)
      return new ResultNoRes(false, '新密码不能与旧密码相同');
    if (!await bcrypt.compare(oldPassword, targetUser.password))
      return new ResultNoRes(false, '旧密码不正确');

    await db.update(users).set({ password: await bcrypt.hash(newPassword, 8) }).where(eq(users.id, id));
    return new ResultNoRes(true, '修改成功');
  }

  async login(id: string, password: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, id)).get();
      if (!(user && (await bcrypt.compare(password, user.password))))
        return new ResultNoRes(false, '用户名或密码错误');
      const accessToken = await this.auth.produceAccessToken(user.id);
      const refreshToken = await this.auth.produceRefreshToken(user.id);
      return new Result(true, '登陆成功', {
        ...(await this.getFullUser(user)).getResOrTRPCError('INTERNAL_SERVER_ERROR'),
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return new Result500();
    }
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    try {
      const token = await db
        .delete(refreshTokens)
        .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
        .returning();
      if (!token[0])
        return new ResultNoRes(false, '请重新登陆');
      const newRefreshToken = await this.auth.produceRefreshToken(id);
      const newAccessToken = await this.auth.produceAccessToken(id);
      return new Result(true, '刷新成功', { accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return new Result500();
    }
  }

  async getFullUser(basicUser: TRawUser) {
    try {
      const groupIds = (
        await db.select().from(usersToGroups).where(eq(usersToGroups.userId, basicUser.id))
      ).map(item => item.groupId);

      const classIds = (
        await db.select().from(classesToUsers).where(eq(classesToUsers.userId, basicUser.id))
      ).map(item => item.classId);

      let projectName, className;
      if (basicUser.role === 'student') {
        if (classIds.length)
          className = (await ctl.cc.getString(classIds[0])).getResOrTRPCError();
        projectName = (await ctl.gc.projectName(groupIds)).getResOrTRPCError();
      }
      return new Result(true, '获取成功', userSerializer(basicUser, groupIds, classIds, projectName, className));
    } catch (err) {
      return new ResultNoRes(false, '获取用户详细信息失败');
    }
  }

  async getProfile(id: string) {
    try {
      const basicUser = await db.select().from(users).where(eq(users.id, id)).get();
      if (!basicUser)
        return new ResultNoRes(false, '用户不存在');
      return new Result(true, '获取成功', (await this.getFullUser(basicUser)).getResOrTRPCError('INTERNAL_SERVER_ERROR'));
    } catch (err) {
      return new ResultNoRes(false, '用户不存在');
    }
  }

  async getList(role: 'student' | 'teacher' | 'admin' | 'all') {
    try {
      const res: Array<TUser> = [];
      for (const basicUser of
        role === 'all'
          ? await db.select().from(users).all()
          : await db.select().from(users).where(eq(users.role, role))
      )
        res.push((await this.getFullUser(basicUser)).getResOrTRPCError('INTERNAL_SERVER_ERROR'));

      return new Result(true, '获取成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async remove(id: string) {
    try {
      await Promise.all([
        db.delete(usersToGroups).where(eq(usersToGroups.userId, id)),
        db.delete(classesToUsers).where(eq(classesToUsers.userId, id)),
      ]);
      await db.delete(users).where(eq(users.id, id));
      return new ResultNoRes(true, '删除成功');
    } catch (err) {
      return new ResultNoRes(false, '用户不存在');
    }
  }
}
