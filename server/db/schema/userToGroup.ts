import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { groups } from './group';

export const usersToGroups = pgTable('users_to_groups', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
