import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';

export const papers = sqliteTable('papers', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  title: text('title', { mode: 'text' }).notNull(),
  category: integer('category').notNull().default(0),
  keywords: text('keywords', { mode: 'json' }).notNull().$type<string[]>(),
  abstract: text('abstract', { mode: 'text' }).notNull(),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  score: text('score', { enum: ['A', 'B', 'C', 'D'] }),
  canDownload: integer('can_download', { mode: 'boolean' }).notNull().default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  comment: text('comment', { mode: 'text' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
