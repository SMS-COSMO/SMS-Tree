import { LibsqlError } from '@libsql/client';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { refreshTokens, users } from '../../db/schema/user';
import { usersToGroups } from '../../db/schema/userToGroup';
import { classesToStudents } from '../../db/schema/classToStudents';
import { Auth } from '../utils/auth';
import { TRPCForbidden, makeId } from '../../trpc/utils/shared';
import { Seiue } from '../utils/seiue';
import { useClassName } from '~/composables/className';
import { classes } from '~/server/db/schema/class';
import { env } from '~/server/env';

export class UserController {
  private auth: Auth;
  constructor() {
    this.auth = new Auth();
  }

  async getUserFromHeader(authorization: string | undefined) {
    if (!authorization)
      return undefined;
    const result = await this.auth.getUserFromToken(authorization);
    if (result.err === 'ERR_JWT_EXPIRED')
      return result.err;
    return result.user;
  }

  async register(newUser: TNewUser & { groupId?: string; classId?: string }) {
    const { groupId, classId, ...rest } = newUser;
    const hash = await bcrypt.hash(newUser.password, 8);
    const user = { ...rest, password: hash };
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
      if ((await db.select().from(users).where(eq(users.schoolId, user.schoolId))).length > 0)
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
    await db.insert(users).values(newUsers);
    return '创建成功';
  }

  async modifyPassword(user: TRawUser, id: string, oldPassword: string, newPassword: string) {
    if (!['admin', 'teacher'].includes(user.role) && user.id !== id)
      throw TRPCForbidden;

    const targetUser = user.id === id
      ? user
      : await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!targetUser)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    if (newPassword === oldPassword)
      throw new TRPCError({ code: 'BAD_REQUEST', message: '新密码不能与旧密码相同' });
    if (!['admin', 'teacher'].includes(user.role) && !await bcrypt.compare(oldPassword, targetUser.password))
      throw new TRPCError({ code: 'BAD_REQUEST', message: '旧密码不正确' });

    await db.update(users).set({ password: await bcrypt.hash(newPassword, 8) }).where(eq(users.id, id));
    return '修改成功';
  }

  async login(schoolId: string, password: string, isSeiue: boolean) {
    if (isSeiue && !env.SEIUE_LOGIN)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '暂不允许使用希悦登录' });

    const user = await db.query.users.findFirst({
      where: eq(users.schoolId, schoolId),
      with: {
        usersToGroups: {
          columns: {},
          with: {
            group: {
              columns: {
                id: true,
                archived: true,
              },
            },
          },
        },
        classesToStudents: {
          columns: {},
          with: {
            classes: {
              columns: { id: true },
            },
          },
        },
      },
    });
    if (!user)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '学号或密码错误' });

    if (isSeiue) {
      try {
        const seiue = await Seiue.init({ schoolId, password });
        if (!seiue)
          throw new TRPCError({ code: 'UNAUTHORIZED', message: '学号或密码错误' });
      } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '学号或密码错误' });
      }
    } else {
      if (!await bcrypt.compare(password, user.password))
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '学号或密码错误' });
    }

    const accessToken = await this.auth.produceAccessToken(user.id);
    const refreshToken = await this.auth.produceRefreshToken(user.id);

    const {
      password: _password,
      usersToGroups: _usersToGroups,
      classesToStudents: _classesToStudents,
      ...info
    } = user;

    if (user.firstTimeLogin)
      await db.update(users).set({ firstTimeLogin: false }).where(eq(users.id, user.id));
    return {
      ...info,
      activeGroupIds: user.usersToGroups.filter(x => !x.group.archived).map(x => x.group.id),
      classId: user.classesToStudents[0]?.classes.id ?? '',
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string, id: string) {
    const token = await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.owner, id)))
      .returning();
    if (!token[0])
      throw new TRPCError({ code: 'UNAUTHORIZED', message: '请重新登录' });

    const newRefreshToken = await this.auth.produceRefreshToken(id);
    const newAccessToken = await this.auth.produceAccessToken(id);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async teacherClasses(id: string) {
    const res = await db.query.classes.findMany({
      where: eq(classes.teacherId, id),
      columns: {
        id: true,
        state: true,
        enterYear: true,
        index: true,
      },
    });
    return res.map(x => ({
      ...x,
      className: useClassName(x),
    }));
  }

  async modify(id: string, newUser: Partial<Omit<TRawUser, 'password' | 'createdAt'>>) {
    await db.update(users).set(newUser).where(eq(users.id, id));
    return '修改成功';
  }

  async profile(id: string, user: TRawUser) {
    const accessible = ['teacher', 'admin'].includes(user.role) || user.id === id;
    const res = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        usersToGroups: {
          columns: {},
          with: {
            group: {
              columns: {
                id: true,
                archived: true,
              },
              with: {
                paper: {
                  columns: {
                    id: true,
                    canDownload: true,
                    category: true,
                    createdAt: true,
                    isFeatured: true,
                    isPublic: true,
                    score: true,
                    title: true,
                    abstract: true,
                  },
                },
              },
            },
          },
        },
        classesToStudents: {
          columns: {},
          with: {
            classes: true,
          },
        },
      },
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '用户不存在' });

    const {
      password: _password,
      usersToGroups: _usersToGroups,
      classesToStudents: _classesToStudents,
      schoolId,
      ...info
    } = res;

    return {
      ...info,
      className: useClassName(res.classesToStudents[0]?.classes),
      groups: res.usersToGroups.map((x) => {
        const g = x.group;
        if (!accessible && !g.paper?.isPublic)
          g.paper = null;
        return g;
      }),
      classId: res.classesToStudents[0]?.classes.id ?? '',
      schoolId: accessible ? schoolId : undefined,
    };
  }

  async list(role: 'student' | 'teacher' | 'admin' | 'all') {
    const res = await db.query.users.findMany({
      where: role === 'all' ? undefined : eq(users.role, role as 'student' | 'teacher' | 'admin'),
      with: {
        usersToGroups: {
          columns: {},
          with: {
            group: {
              columns: {
                id: true,
                projectName: true,
              },
            },
          },
        },
        classesToStudents: {
          columns: {},
          with: {
            classes: true,
          },
        },
      },
    });

    return res.map((user) => {
      const {
        password: _password,
        usersToGroups: _usersToGroups,
        classesToStudents: _classesToStudents,
        ...info
      } = user;

      return {
        ...info,
        projectName: user.usersToGroups[0]?.group.projectName,
        className: useClassName(user.classesToStudents[0]?.classes),
        classId: user.classesToStudents[0]?.classes.id ?? '',
      };
    });
  }

  async remove(id: string) {
    try {
      await db.delete(users).where(eq(users.id, id));
      return '删除成功';
    } catch {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }
  }
}
