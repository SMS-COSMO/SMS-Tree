import { and, eq } from 'drizzle-orm';
import type { TRawClass } from '../../db/db';
import { db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToUsers } from '../../db/schema/classToUser';
import type { TClass } from '../serializer/class';
import { classSerializer } from '../serializer/class';
import { Result, Result500, ResultNoRes } from '../utils/result';

export class ClassController {
  async create(newClass: {
    index: number;
    enterYear: number;
    state: 'archived' | 'initialized' | 'selectGroup' | 'submitPaper';
    students: string[];
    teacher: string;
  }) {
    let insertedId: string;
    try {
      insertedId = (await db.insert(classes).values(newClass).returning({ id: classes.id }))[0].id;
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

  private async getFullClass(basicClass: TRawClass) {
    try {
      const students = (
        await db.select().from(classesToUsers)
          .where(and(eq(classesToUsers.classId, basicClass.id), eq(classesToUsers.type, 'student')))
      ).map(item => item.userId);
      const teacher = (await db.select().from(classesToUsers)
        .where(and(eq(classesToUsers.classId, basicClass.id), eq(classesToUsers.type, 'teacher'))))[0].userId;
      return new Result(true, '', classSerializer(basicClass, students, teacher));
    } catch (err) {
      return new Result500();
    }
  }

  async getContent(id: string) {
    try {
      const res = (await db.select().from(classes).where(eq(classes.id, id)))[0];
      return new Result(true, '查询成功', res);
    } catch (err) {
      return new ResultNoRes(false, '班级不存在');
    }
  }

  async getFullContent(id: string) {
    try {
      const basicClass = (await db.select().from(classes).where(eq(classes.id, id)))[0];
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
          async basicClass => (await this.getFullClass(basicClass)).getResOrTRPCError('INTERNAL_SERVER_ERROR')
        ),
      );

      return new Result(true, '查询成功', res);
    } catch (err) {
      return new Result500();
    }
  }
}
