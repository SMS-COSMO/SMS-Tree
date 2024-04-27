import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { classesToStudents } from './classToStudents';
import { users } from './user';
import { groups } from './group';

export const classes = sqliteTable('classes', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  index: integer('index', { mode: 'number' }).notNull(),
  enterYear: integer('enter_year', { mode: 'number' }).notNull(),
  teacherId: text('teacher_id').notNull(),
  state: text('state', { enum: [
    'initialized', // 初始化
    'selectGroup', // 选择小组
    'thesisProposal', // 开题报告
    'concludingReport', // 结题报告
    'submitPaper', // 提交论文
  ] }).notNull().default('initialized'),
  stateTimetable: text('state_timetable', { mode: 'json' }).notNull().$type<number[]>(),
});

export const classesRelations = relations(classes, ({ many, one }) => ({
  classesToStudents: many(classesToStudents),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  groups: many(groups),
}));
