import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToStudents } from '../../db/schema/classToStudents';
import { getClassName } from '../utils/shared';
import { groups } from '~/server/db/schema/group';
import type { TClassState } from '~/types';

export class ClassController {
  async create(newClass: {
    index: number;
    enterYear: number;
    state: TClassState;
    students: string[];
    teacherId: string;
    stateTimeTable?: Date[];
  }) {
    // TODO: use transactions
    const { stateTimeTable, ...rest } = newClass;
    const insertedId = (await db
      .insert(classes)
      .values({
        stateTimeTable: (stateTimeTable?.map(x => x.getTime()) ?? []),
        ...rest,
      })
      .returning({ id: classes.id })
      .get()
    ).id;

    await db.insert(classesToStudents).values(
      newClass.students.map(
        item => ({
          classId: insertedId,
          userId: item,
        }),
      ),
    );

    return '创建成功';
  }

  async remove(id: string) {
    const g = await db.query.classes.findFirst({
      where: eq(classes.id, id),
      columns: {},
      with: {
        groups: {
          columns: { id: true },
        },
      },
    });
    await Promise.all(g?.groups.map(
      x => db.update(groups).set({ archived: true }).where(eq(groups.id, x.id)),
    ) ?? []);
    await db.delete(classes).where(eq(classes.id, id));
    return '删除成功';
  }

  async modifyState(id: string, newState: TClassState) {
    await db.update(classes).set({ state: newState }).where(eq(classes.id, id));
    return '修改成功';
  }

  async info(id: string) {
    return await db.query.classes.findFirst({
      where: eq(classes.id, id),
    });
  }

  async infoFull(id: string) {
    const res = await db.query.classes.findFirst({
      where: eq(classes.id, id),
      with: {
        classesToStudents: {
          columns: {},
          with: {
            users: {
              columns: {
                id: true,
                schoolId: true,
                username: true,
              },
            },
          },
        },
        teacher: {
          columns: {
            id: true,
            schoolId: true,
            username: true,
          },
        },
        groups: {
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
            papers: {
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
        },
      },
    });
    if (!res)
      throw new TRPCError({ code: 'NOT_FOUND', message: '班级不存在' });

    const {
      classesToStudents: _classesToStudents,
      groups,
      ...info
    } = res;

    return {
      ...info,
      students: res.classesToStudents.map(x => x.users),
      className: getClassName(info),
      groups: groups.map((group) => {
        const { usersToGroups, leader: _, ...info } = group;
        const members = usersToGroups.map(u => u.user);
        return {
          members,
          leader: members.find(x => x.id === group.leader),
          ...info,
        };
      }),
    };
  }

  async getList(teacherId?: string) {
    const res = await db.query.classes.findMany({
      where: teacherId ? eq(classes.teacherId, teacherId) : undefined,
      with: {
        teacher: {
          columns: {
            id: true,
            schoolId: true,
            username: true,
          },
        },
      },
    });

    return res.map(x => ({
      className: getClassName(x),
      ...x,
    }));
  }

  async initGroups(id: string, amount: number) {
    try {
      const classFromDb = await db.query.classes.findFirst({
        where: eq(classes.id, id),
        columns: { enterYear: true },
      });
      if (!classFromDb)
        throw new TRPCError({ code: 'NOT_FOUND', message: '班级不存在' });

      await Promise.all(
        [...Array(amount)].map(
          () => db.insert(groups).values({ classId: id, enterYear: classFromDb.enterYear }),
        ),
      );
      return '创建成功';
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法创建小组' });
    }
  }
}
