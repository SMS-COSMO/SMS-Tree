import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { users } from './user';
import { classes } from './class';
import { notes } from './note';
import { papers } from './paper';
import { usersToGroups } from './userToGroup';
import { reports } from './report';

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  leader: text('leader').references(() => users.id, { onDelete: 'set null', onUpdate: 'set null' }),
  enterYear: integer('enter_year', { mode: 'number' }).notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  projectName: text('project_name'),
  classId: text('class_id').references(() => classes.id, { onDelete: 'set null', onUpdate: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const groupsRelations = relations(groups, ({ many, one }) => ({
  usersToGroups: many(usersToGroups),
  notes: many(notes),
  reports: many(reports),
  papers: many(papers),
  class: one(classes, {
    fields: [groups.classId],
    references: [classes.id],
  }),
}));
