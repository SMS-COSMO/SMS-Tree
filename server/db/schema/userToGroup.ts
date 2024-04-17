import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { groups } from './group';

export const usersToGroups = sqliteTable('users_to_groups', {
  userId: text('user_id', { mode: 'text' }).notNull().references(() => users.id),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
}, t => ({
  pk: primaryKey({ columns: [t.userId, t.groupId] }),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
}));
