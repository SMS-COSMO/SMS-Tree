import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { classes } from './class';
import { users } from './user';

export const classesToStudents = sqliteTable('classes_to_students', {
  classId: text('class_id').notNull().references(() => classes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => ({
  pk: primaryKey({ columns: [t.classId, t.userId] }),
}));

export const classesToStudentsRelations = relations(classesToStudents, ({ one }) => ({
  classes: one(classes, {
    fields: [classesToStudents.classId],
    references: [classes.id],
  }),
  users: one(users, {
    fields: [classesToStudents.userId],
    references: [users.id],
  }),
}));
