import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const classes = sqliteTable('classes', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => nanoid(12)),
  index: integer('index', { mode: 'number' }).notNull(),
  enterYear: integer('enter_year', { mode: 'number' }).notNull(),
  state: text('state', { enum: ['initialized', 'selectGroup', 'submitPaper', 'archived'] }).notNull().default('initialized'),
});
