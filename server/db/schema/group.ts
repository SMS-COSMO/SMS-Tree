import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { users } from './user';
import { classes } from './class';

export const groups = sqliteTable('groups', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  leader: text('leader', { mode: 'text' }).notNull().references(() => users.id),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  classId: text('class_id', { mode: 'text' }).notNull().references(() => classes.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
