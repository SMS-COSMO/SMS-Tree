import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';
import { users } from './user';
import { classes } from './class';

export const groups = sqliteTable('groups', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  leader: text('leader', { mode: 'text' }).references(() => users.id),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  projectName: text('project_name', { mode: 'text' }),
  classId: text('class_id', { mode: 'text' }).notNull().references(() => classes.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
