import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';
import { attachments } from './attachment';

export const reports = pgTable('reports', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  category: text('category', { enum: ['thesisProposal', 'concludingReport'] }).notNull(),
  read: boolean('read').default(false).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reportsRelations = relations(reports, ({ one, many }) => ({
  group: one(groups, {
    fields: [reports.groupId],
    references: [groups.id],
  }),
  attachments: many(attachments),
}));
