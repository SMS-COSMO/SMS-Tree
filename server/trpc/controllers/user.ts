import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import { and, eq, sql } from 'drizzle-orm';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { TRPCError } from '@trpc/server';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { refreshTokens, users } from '../../db/schema/user';
import { userSerializer, userSerializerSafe } from '../serializer/user';
import { usersToGroups } from '../../db/schema/userToGroup';
import { classesToStudents } from '../../db/schema/classToStudents';
import { ctl } from '../context';
import { Auth } from '../utils/auth';
import { TRPCForbidden, makeId, useTry } from '../../trpc/utils/shared';
import { classes } from '~/server/db/schema/class';
import { PClassId, PGetBasicUser, PGroupIds } from '~/server/db/statements';

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

  async register(newUser: TNewUser & { groupId?: string; classId?: string }) {
    const { schoolId, username, password, role, groupId, classId } = newUser;
    const hash = await bcrypt.hash(password, 8);
    const user = { schoolId, username, password: hash, role };
    try {
      // TODO: use transaction
      const insertedId = (await db.insert(users).values(user).returning({ id: users.id }).get()).id;
      if (groupId)
        await db.insert(usersToGroups).values({ userId: insertedId, groupId });
      if (classId)
        await db.insert(classesToStudents).values({ userId: insertedId, classId });

      return '注册成功';
    } catch (err) {
      if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
        throw new TRPCError({ code: 'BAD_REQUEST', message: '学工号出现重复' });
      else
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '注册失败' });
    }
  }

  async bulkRegister(inputUsers: { schoolId: string; username: string }[], randomPassword?: boolean) {
    if ((new Set(inputUsers.map(user => user.schoolId))).size !== inputUsers.length)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '学工号出现重复' });

    for (const user of inputUsers) {
      if ((await useTry(() => db.select().from(users).where(eq(users.schoolId, user.schoolId)))).length > 0)
        throw new TRPCError({ code: 'BAD_REQUEST', message: '学工号出现重复' });
    }

    const newUsers = await Promise.all(inputUsers.map(async ({ schoolId, username }) => {
      const password = randomPassword ? await bcrypt.hash(makeId(12), 8) : await bcrypt.hash(schoolId, 8);
      return {
        schoolId,
        role: 'student',
        password,
        username,
        groupIds: [],
      } as TNewUser & { groupIds: string[] };
    }));
    await useTry(() => db.insert(users).values(newUsers));
    return '创建成功';
  }

  async modifyPassword(user: TRawUser, id: string, oldPassword: string, newPassword: string) {
    if (!['admin', 'teacher'].includes(user.role) && user.id !== id)
      throw TRPCForbidden;

    const targetUser = user.id === id
      ? user
      : await useTry(() => db.select().from(users).where(eq(users.id, id)).get());
    if (!targetUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    if (newPassword === oldPassword)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '新密码不能与旧密码相同' });
    if (!await bcrypt.compare(oldPassword, targetUser.password))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '旧密码不正确' });

    await useTry(async () => db.update(users).set({ password: await bcrypt.hash(newPassword, 8) }).where(eq(users.id, id)));
    return '修改成功';
  }

  async login(schoolId: string, password: string) {
    const user = await useTry(async () => db.select().from(users).where(eq(users.schoolId, schoolId)).get());
    if (!(user && (await bcrypt.compare(password, user.password))))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });

    const accessToken = await this.auth.produceAccessToken(user.id);
    const refreshToken = await this.auth.produceRefreshToken(user.id);
    return {
      ...(await this.getFullUser(user)),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await useTry(
      async () => db
        .delete(refreshTokens)
        .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
        .returning(),
    );
    if (!token[0])
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '请重新登陆' });

    const newRefreshToken = await this.auth.produceRefreshToken(id);
    const newAccessToken = await this.auth.produceAccessToken(id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getFullUserSafe(basicUser: TRawUser) {
    return userSerializerSafe(await this.getFullUser(basicUser));
  }

  async getFullUser(basicUser: TRawUser) {
    const groupIds = (
      await useTry(
        () => PGroupIds.all({ id: basicUser.id }),
      )
    ).map(item => item.groupId);

    const classId = (await useTry(
      () => PClassId.get({ id: basicUser.id }),
    ))?.classId;

    let projectName, className;
    if (basicUser.role === 'student') {
      if (classId)
        className = await ctl.cc.getString(classId);
      projectName = await ctl.gc.projectName(groupIds);
    }
    return userSerializer(basicUser, groupIds, classId, projectName, className);
  }

  async getTeacherClasses(id: string) {
    const res = (await useTry(
      () => db.select({ id: classes.id }).from(classes).where(eq(classes.teacherId, id)).all(),
    )).map(x => x.id);
    return res;
  }

  async modify(id: string, newUser: Partial<Omit<TRawUser, 'password' | 'createdAt'>>) {
    await useTry(() => db.update(users).set(newUser).where(eq(users.id, id)));
    return '修改成功';
  }

  async getProfile(id: string) {
    const basicUser = await useTry(() => PGetBasicUser.get({ id }));
    if (!basicUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });
    return await this.getFullUser(basicUser);
  }

  async getProfileSafe(id: string) {
    const basicUser = await useTry(() => PGetBasicUser.get({ id }));
    if (!basicUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });
    return await this.getFullUserSafe(basicUser);
  }

  async getList(role: 'student' | 'teacher' | 'admin' | 'all') {
    const userList = role === 'all'
      ? await useTry(() => db.select().from(users).all())
      : await useTry(() => db.select().from(users).where(eq(users.role, role)));

    const res = await Promise.all(userList.map(async basicUser => this.getFullUser(basicUser)));
    return res;
  }

  async remove(id: string) {
    try {
      await Promise.all([
        db.delete(usersToGroups).where(eq(usersToGroups.userId, id)),
        db.delete(classesToStudents).where(eq(classesToStudents.userId, id)),
      ]);
      await db.delete(users).where(eq(users.id, id));
      return '删除成功';
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }
  }
}
