import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { usersToGroups } from './userToGroup';
import { classesToStudents } from './classToStudents';
import { classes } from './class';

export const users = sqliteTable('users', {
  id: text('id', { mode: 'text' }).$defaultFn(() => makeId(12)).primaryKey(),
  schoolId: text('school_id', { mode: 'text' }).notNull().unique(),
  username: text('username', { mode: 'text' }).notNull(),
  password: text('password', { mode: 'text' }).notNull(),
  role: text('role', { enum: ['admin', 'student', 'teacher'] }).notNull().default('student'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  classesToStudents: many(classesToStudents),
  teacherClasses: many(classes), // This is only for teachers
}));

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  token: text('token', { mode: 'text' }).notNull(),
  owner: text('owner', { mode: 'text' }).references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
});
