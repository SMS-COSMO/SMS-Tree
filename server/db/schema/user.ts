import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';

export const users = sqliteTable('users', {
  id: text('id', { mode: 'text' }).$defaultFn(() => makeId(12)).primaryKey(),
  schoolID: text('school_id', { mode: 'text' }).notNull().unique(),
  username: text('username', { mode: 'text' }).notNull(),
  password: text('password', { mode: 'text' }).notNull(),
  role: text('role', { enum: ['admin', 'student', 'teacher'] }).notNull().default('student'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  token: text('token', { mode: 'text' }).notNull(),
  owner: text('owner', { mode: 'text' }).references(() => users.id).notNull(),
});
