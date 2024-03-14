import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';

export const papers = sqliteTable('papers', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  title: text('title', { mode: 'text' }).notNull(),
  keywords: text('keywords', { mode: 'json' }).notNull().$type<string[]>(),
  abstract: text('abstract', { mode: 'text' }).notNull(),
  status: integer('status').notNull().default(0),
  rate: integer('rate').notNull().default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  canDownload: integer('can_download', { mode: 'boolean' }).notNull().default(false),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  comment: text('comment', { mode: 'text' }),
});
