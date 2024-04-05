import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { TRawClass } from '../../db/db';
import { db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToStudents } from '../../db/schema/classToStudents';
import { classSerializer } from '../serializer/class';
import { ctl } from '../context';
import { useTry } from '../utils/shared';
import type { TClassState } from '~/types';
import { PClassContent, PGetStudents } from '~/server/db/statements';

export class ClassController {
  async create(newClass: {
    index: number;
    enterYear: number;
    state: TClassState;
    students: string[];
    teacherId: string;
  }) {
    // TODO: use transactions
    const insertedId = await useTry(
      async () => (await db.insert(classes).values(newClass).returning({ id: classes.id }).get()).id,
    );

    await useTry(
      async () => db.insert(classesToStudents).values(
        newClass.students.map(
          item => ({
            classId: insertedId,
            userId: item,
          }),
        ),
      ),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法将用户加入班级' },
    );

    return '创建成功';
  }

  async remove(id: string) {
    try {
      await db.delete(classesToStudents).where(eq(classesToStudents.classId, id));
      await db.delete(classes).where(eq(classes.id, id));
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '删除失败' });
    }

    return '删除成功';
  }

  async getString(id: string, classInfo?: TRawClass) {
    classInfo ??= await this.getContent(id);
    if (!classInfo)
      return '未知';

    const now = new Date();
    const yearString = ['新高一', '高一', '高二', '高三', '毕业'];
    const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

    return `${yearString[year]}（${classInfo.index}）`;
  }

  private async getFullClass(basicClass: TRawClass | undefined) {
    if (!basicClass)
      throw new TRPCError({ code: 'NOT_FOUND', message: '班级不存在' });

    const students = await useTry(
      async () => (
        await PGetStudents.all({ id: basicClass.id })
      ).map(item => item.userId),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法获取学生' },
    );

    const teacher = await useTry(
      async () => ctl.uc.getProfile(basicClass.teacherId),
      { code: 'INTERNAL_SERVER_ERROR', message: '无法获取教师' },
    );

    const className = await this.getString('', basicClass);
    return classSerializer(basicClass, students, teacher, className);
  }

  async modifyState(id: string, newState: TClassState) {
    await useTry(() => db.update(classes).set({ state: newState }).where(eq(classes.id, id)));
    return '修改成功';
  }

  async getContent(id: string) {
    return await useTry(() => PClassContent.get({ id }));
  }

  async getFullContent(id: string) {
    const basicClass = await useTry(() => PClassContent.get({ id }));
    return await this.getFullClass(basicClass);
  }

  async getList() {
    const res = await Promise.all(
      (await db.select().from(classes)).map(
        async basicClass => await this.getFullClass(basicClass),
      ),
    );

    return res;
  }

  async initGroups(id: string, amount: number) {
    try {
      await Promise.all(
        [...Array(amount)].map(() => ctl.gc.create({ classId: id })),
      );
      return '创建成功';
    } catch (err) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '无法创建小组' });
    }
  }
}
