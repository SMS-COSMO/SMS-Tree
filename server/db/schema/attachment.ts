import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';
import { papers } from './paper';

export const attachments = sqliteTable('attachments', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  name: text('name', { mode: 'text' }).notNull(),
  paperId: text('paper_id', { mode: 'text' }).references(() => papers.id),
  isMainFile: integer('is_main_file', { mode: 'boolean' }).notNull().default(false),
  fileType: text('file_type', { mode: 'text' }).notNull(),
  S3FileId: text('s3_file_id', { mode: 'text' }).notNull(),
});
