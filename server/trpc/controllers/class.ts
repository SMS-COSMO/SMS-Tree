import { eq } from 'drizzle-orm';
import { TRawClass, db } from '../../db/db';
import { classes } from '../../db/schema/class';
import { classesToUsers } from '../../db/schema/classToUser';
import { TClass, classSerializer } from '../serializer/class';

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
            return { success: false, message: '服务器内部错误' };
        }

        try {
            await db.insert(classesToUsers).values(newClass.students.map(item => ({
                classId: insertedId,
                userId: item,
            })));
            await db.insert(classesToUsers).values({ classId: insertedId, userId: newClass.teacher });
        } catch (err) {
            return { success: false, message: '用户不存在' };
        }

        return { success: true, message: '创建成功' };
    }

    async remove(id: string) {
        try {
            await db.delete(classesToUsers).where(eq(classesToUsers.classId, id));
            await db.delete(classes).where(eq(classes.id, id));
            return { success: true, message: '删除成功' };
        } catch (err) {
            return { success: false, message: '班级不存在' };
        }
    }

    async getFullClass(basicClass: TRawClass) {
        const users = (
            await db.select().from(classesToUsers)
                .where(eq(classesToUsers.classId, basicClass.id))
        ).map(item => item.userId);
        return classSerializer(basicClass, users);
    }

    async getContent(id: string) {
        try {
            const basicClass = (await db.select().from(classes).where(eq(classes.id, id)))[0];
            return { success: true, res: await this.getFullClass(basicClass), message: '查询成功' };
        } catch (err) {
            return { success: false, message: '班级不存在' };
        }
    }

    async getList() {
        try {
            const res: Array<TClass> = [];
            for (const basicClass of await db.select().from(classes))
                res.push(await this.getFullClass(basicClass));

            return { success: true, res, message: '查询成功' };
        } catch (err) {
            return { success: false, message: '服务器内部错误' };
        }
    }
}
