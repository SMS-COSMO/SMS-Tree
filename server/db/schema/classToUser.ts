import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { classes } from './class';
import { users } from './user';

export const classesToUsers = sqliteTable('classes_to_users', {
    classId: text('class_id', { mode: 'text' }).notNull().references(() => classes.id),
    userId: text('user_id', { mode: 'text' }).notNull().references(() => users.id),
}, t => ({
    pk: primaryKey(t.classId, t.userId),
}));
