import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';
import { attachments } from './attachment';

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  category: text('category', { enum: ['thesisProposal', 'concludingReport'] }).notNull(),
  read: integer('read', { mode: 'boolean' }).default(false).notNull(),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const reportsRelations = relations(reports, ({ one, many }) => ({
  group: one(groups, {
    fields: [reports.groupId],
    references: [groups.id],
  }),
  attachments: many(attachments),
}));
