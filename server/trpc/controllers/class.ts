import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToStudents } from '../../db/schema/classToStudents';
import { useClassName } from '~/composables/className';
import { groups } from '~/server/db/schema/group';
import type { TClassState } from '~/types';
import { reports } from '~/server/db/schema/report';
import { notes } from '~/server/db/schema/note';

export class ClassController {
  async create(newClass: {
    index: number;
    enterYear: number;
    state: TClassState;
    students: string[];
    teacherId: string;
    stateTimetable?: Date[];
  }) {
    // TODO: use transactions
    const { stateTimetable, ...rest } = newClass;
    const insertedId = (await db
      .insert(classes)
      .values({
        stateTimetable: (stateTimetable?.map(x => x.getTime()) ?? []),
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
      async (x) => {
        await db.update(groups).set({ archived: true }).where(eq(groups.id, x.id));
        await db.delete(reports).where(eq(reports.groupId, x.id));
        await db.delete(notes).where(eq(notes.groupId, x.id));
      },
    ) ?? []);
    await db.delete(classes).where(eq(classes.id, id));
    return '删除成功';
  }

  async batchRemove(ids: string[]) {
    await Promise.all(ids.map(x => this.remove(x)));
    return '删除成功';
  }

  async modify(id: string, newClass: Partial<{
    index: number;
    enterYear: number;
    state: TClassState;
    teacherId: string;
    stateTimetable?: Date[];
  }>) {
    const { stateTimetable, ...rest } = newClass;
    await db
      .update(classes)
      .set({
        stateTimetable: stateTimetable ? (stateTimetable?.map(x => x.getTime()) ?? []) : undefined,
        ...rest,
      })
      .where(eq(classes.id, id));
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
            paper: {
              columns: {
                id: true,
                canDownload: true,
                category: true,
                createdAt: true,
                isFeatured: true,
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
      className: useClassName(info),
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
      className: useClassName(x),
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
    } catch {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法创建小组' });
    }
  }
}
