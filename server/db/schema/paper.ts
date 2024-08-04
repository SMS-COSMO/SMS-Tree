import { boolean, integer, json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';
import { attachments } from './attachment';
import { bookmarks } from './bookmark';

export const papers = pgTable('papers', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  title: text('title').notNull(),
  category: integer('category').notNull().default(0),
  keywords: json('keywords').notNull().$type<string[]>(),
  abstract: text('abstract').notNull(),
  groupId: text('group_id').references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }).notNull(),
  isPublic: boolean('is_public').notNull().default(false),
  canDownload: boolean('can_download').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const papersRelations = relations(papers, ({ one, many }) => ({
  group: one(groups, {
    fields: [papers.groupId],
    references: [groups.id],
  }),
  attachments: many(attachments),
  bookmarks: many(bookmarks),
}));
