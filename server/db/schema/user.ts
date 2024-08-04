import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { usersToGroups } from './userToGroup';
import { classesToStudents } from './classToStudents';
import { classes } from './class';
import { bookmarks } from './bookmark';

export const users = pgTable('users', {
  id: text('id').$defaultFn(() => makeId(12)).primaryKey(),
  schoolId: text('school_id').notNull().unique(),
  username: text('username').notNull(),
  password: text('password').notNull(),
  initialPassword: boolean('initial_password').notNull().default(true),
  role: text('role', { enum: ['admin', 'student', 'teacher'] }).notNull().default('student'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  classesToStudents: many(classesToStudents),
  bookmarks: many(bookmarks),
  teacherClasses: many(classes), // This is only for teachers
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  token: text('token').notNull(),
  owner: text('owner').references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
});
