import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { classes } from './class';
import { users } from './user';

export const classesToStudents = sqliteTable('classes_to_students', {
  classId: text('class_id', { mode: 'text' }).notNull().references(() => classes.id),
  userId: text('user_id', { mode: 'text' }).notNull().references(() => users.id),
}, t => ({
  pk: primaryKey({ columns: [t.classId, t.userId] }),
}));
