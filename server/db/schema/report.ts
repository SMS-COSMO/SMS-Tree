import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';

export const reports = sqliteTable('reports', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
  category: text('category', { enum: ['thesisProposal', 'concludingReport'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  group: one(groups, {
    fields: [reports.groupId],
    references: [groups.id],
  }),
}));
