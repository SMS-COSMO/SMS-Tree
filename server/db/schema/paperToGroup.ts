import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { groups } from './group';
import { papers } from './paper';

export const papersToGroups = sqliteTable('papers_to_groups', {
  paperId: text('paper_id', { mode: 'text' }).notNull().references(() => papers.id),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
}, t => ({
  pk: primaryKey(t.paperId, t.groupId),
}));
