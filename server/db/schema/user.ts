import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { usersToGroups } from './userToGroup';
import { classesToStudents } from './classToStudents';
import { classes } from './class';
import { bookmarks } from './bookmark';

export const users = sqliteTable('users', {
  id: text('id').$defaultFn(() => makeId(12)).primaryKey(),
  schoolId: text('school_id').notNull().unique(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  initialPassword: integer('initial_password', { mode: 'boolean' }).notNull().default(true),
  role: text('role', { enum: ['admin', 'student', 'teacher'] }).notNull().default('student'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  classesToStudents: many(classesToStudents),
  bookmarks: many(bookmarks),
  teacherClasses: many(classes), // This is only for teachers
}));

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  token: text('token').notNull(),
  owner: text('owner').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
});
