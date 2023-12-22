import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './user';
import { groups } from './group';

export const usersToGroups = sqliteTable('users_to_groups', {
  userId: text('user_id', { mode: 'text' }).notNull().references(() => users.id),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
}, t => ({
  pk: primaryKey(t.userId, t.groupId),
}));
