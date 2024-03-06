import { and, eq } from 'drizzle-orm';
import type { TRawClass } from '../../db/db';
import { db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToUsers } from '../../db/schema/classToUser';
import { classSerializer } from '../serializer/class';
import { ctl } from '../context';
import { Result, Result500, ResultNoRes } from '../utils/result';

type TState = 'archived' | 'initialized' | 'selectGroup' | 'submitPaper';

export class ClassController {
  async create(newClass: {
    index: number;
    enterYear: number;
    state: TState;
    students: string[];
    teacher: string;
  }) {
    let insertedId: string;
    try {
      insertedId = (await db.insert(classes).values(newClass).returning({ id: classes.id }).get()).id;
    } catch (err) {
      return new Result500();
    }

    try {
      await db.insert(classesToUsers).values(newClass.students.map(item => ({
        classId: insertedId,
        userId: item,
      })));
      await db.insert(classesToUsers).values({ classId: insertedId, userId: newClass.teacher, type: 'teacher' });
    } catch (err) {
      return new ResultNoRes(false, '用户不存在');
    }
    return new ResultNoRes(true, '创建成功');
  }

  async remove(id: string) {
    try {
      await db.delete(classesToUsers).where(eq(classesToUsers.classId, id));
      await db.delete(classes).where(eq(classes.id, id));
    } catch (err) {
      return new ResultNoRes(false, '班级不存在');
    }
    return new ResultNoRes(true, '删除成功');
  }

  async getString(id: string, classInfo?: TRawClass) {
    try {
      if (!classInfo && !id)
        return new Result(true, '查询成功', '未知');
      classInfo ??= (await this.getContent(id)).getResOrTRPCError();
      const now = new Date();
      const yearString = ['新高一', '高一', '高二', '高三', '毕业'];
      const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

      return new Result(true, '查询成功', `${yearString[year]}（${classInfo.index}）`);
    } catch (err) {
      return new Result500();
    }
  }

  private async getFullClass(basicClass: TRawClass | undefined) {
    try {
      if (!basicClass)
        return new ResultNoRes(false, '班级不存在');

      const students = (
        await db.select({ userId: classesToUsers.userId }).from(classesToUsers)
          .where(and(eq(classesToUsers.classId, basicClass.id), eq(classesToUsers.type, 'student')))
      ).map(item => item.userId);
      const teacher = (await db.select({ userId: classesToUsers.userId }).from(classesToUsers)
        .where(and(eq(classesToUsers.classId, basicClass.id), eq(classesToUsers.type, 'teacher'))).get())?.userId;
      const className = (await this.getString('', basicClass)).getResOrTRPCError();

      return new Result(true, '', classSerializer(basicClass, students, teacher, className));
    } catch (err) {
      return new Result500();
    }
  }

  async modifyState(id: string, newState: TState) {
    try {
      await db.update(classes).set({ state: newState }).where(eq(classes.id, id));
    } catch (err) {
      return new Result500();
    }
    return new ResultNoRes(true, '修改成功');
  }

  async getContent(id: string) {
    try {
      const res = await db.select().from(classes).where(eq(classes.id, id)).get();
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new ResultNoRes(false, '班级不存在');
    }
  }

  async getFullContent(id: string) {
    try {
      const basicClass = await db.select().from(classes).where(eq(classes.id, id)).get();
      const res = (await this.getFullClass(basicClass)).getResOrTRPCError('INTERNAL_SERVER_ERROR');
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new ResultNoRes(false, '班级不存在');
    }
  }

  async getList() {
    try {
      const res = await Promise.all(
        (await db.select().from(classes)).map(
          async basicClass => (await this.getFullClass(basicClass)).getResOrTRPCError('INTERNAL_SERVER_ERROR'),
        ),
      );

      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }

  async initGroups(id: string, amount: number) {
    try {
      await Promise.all(
        [...Array(amount)].map(() => ctl.gc.create({ classId: id })),
      );
      return new ResultNoRes(true, '创建成功');
    } catch (err) {
      return new Result500();
    }
  }
}
