import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';
import { attachments } from './attachment';

export const papers = sqliteTable('papers', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  title: text('title').notNull(),
  category: integer('category').notNull().default(0),
  keywords: text('keywords', { mode: 'json' }).notNull().$type<string[]>(),
  abstract: text('abstract').notNull(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  canDownload: integer('can_download', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  comment: text('comment'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const papersRelations = relations(papers, ({ one, many }) => ({
  group: one(groups, {
    fields: [papers.groupId],
    references: [groups.id],
  }),
  attachments: many(attachments),
}));
