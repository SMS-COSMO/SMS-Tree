import bcrypt from 'bcrypt';
import { and, eq, gt } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TNewUser, TRawUser } from '../../db/db';
import { db } from '../../db/db';
import { refreshTokens, users } from '../../db/schema/user';
import { usersToGroups } from '../../db/schema/userToGroup';
import { classesToStudents } from '../../db/schema/classToStudents';
import { Auth } from '../utils/auth';
import { TRPCForbidden } from '../../trpc/utils/shared';
import { Seiue } from '../utils/seiue';
import { classes } from '~/server/db/schema/class';
import { env } from '~/server/env';
import { className } from '~/utils/class';

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
    const user = {
      ...rest,
      password: hash,
      initialPassword: false,
    };
    try {
      // TODO: use transaction
      const insertedId = (await db.insert(users).values(user).returning({ id: users.id }))[0].id;
      if (groupId)
        await db.insert(usersToGroups).values({ userId: insertedId, groupId });
      if (classId)
        await db.insert(classesToStudents).values({ userId: insertedId, classId });

      return '注册成功';
    } catch (err) {
      if ((err as any)?.message === 'duplicate key value violates unique constraint "users_school_id_unique"')
        throw new TRPCError({ code: 'BAD_REQUEST', message: '学工号出现重复' });
      else
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '注册失败' });
    }
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

    if (user.initialPassword)
      await db.update(users).set({ initialPassword: false }).where(eq(users.id, user.id));

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
      usersToGroups,
      classesToStudents,
      ...info
    } = user;

    return {
      ...info,
      activeGroupIds: usersToGroups.filter(x => !x.group.archived).map(x => x.group.id),
      classId: classesToStudents[0]?.classes.id ?? '',
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
      className: className(x),
    }));
  }

  async modify(id: string, newUser: Partial<Omit<TRawUser, 'password' | 'createdAt' | 'id'>> & { classId?: string }) {
    const { classId, ...rest } = newUser;
    await db.update(users).set(rest).where(eq(users.id, id));
    await db.update(classesToStudents).set({ classId }).where(eq(classesToStudents.userId, id));
    return '修改成功';
  }

  async profile(id: string, user: TRawUser) {
    const accessible = ['teacher', 'admin'].includes(user.role) || user.id === id;
    const res = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        role: true,
        schoolId: true,
        username: true,
      },
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
      usersToGroups,
      classesToStudents,
      schoolId,
      ...info
    } = res;

    return {
      ...info,
      className: accessible ? className(classesToStudents[0]?.classes) : undefined,
      groups: usersToGroups.map((x) => {
        const g = x.group;
        if (!accessible && !g.paper?.isPublic)
          g.paper = null;
        return g;
      }),
      classId: classesToStudents[0]?.classes.id ?? '',
      schoolId: accessible ? schoolId : undefined,
    };
  }

  async list(role: 'student' | 'teacher' | 'admin' | 'all', showOld: boolean) {
    const res = await db.query.users.findMany({
      where: and(
        role === 'all' ? undefined : eq(users.role, role as 'student' | 'teacher' | 'admin'),
        showOld ? undefined : gt(users.createdAt, new Date(Date.now() - 3 * 31556952000)), // 3 years
      ),
      columns: {
        id: true,
        schoolId: true,
        username: true,
      },
      with: {
        usersToGroups: {
          columns: {},
          with: {
            group: {
              columns: {
                projectName: true,
              },
            },
          },
        },
        classesToStudents: {
          columns: {},
          with: {
            classes: {
              columns: {
                id: true,
                enterYear: true,
                index: true,
              },
            },
          },
        },
      },
    });

    return res.map((user) => {
      const {
        usersToGroups,
        classesToStudents,
        ...info
      } = user;

      return {
        ...info,
        projectName: usersToGroups[0]?.group.projectName,
        className: className(classesToStudents[0]?.classes),
        classId: classesToStudents[0]?.classes.id ?? '',
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
