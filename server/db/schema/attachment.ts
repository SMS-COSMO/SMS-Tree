import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { papers } from './paper';
import { reports } from './report';

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  name: text('name').notNull(),
  paperId: text('paper_id').references(() => papers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  reportId: text('report_id').references(() => reports.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  category: text('category', { enum: ['paperDocument', 'paperAttachment', 'reportDocument', 'reportPresentation'] }).notNull(),
  fileType: text('file_type').notNull(),
  S3FileId: text('s3_file_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  paper: one(papers, {
    fields: [attachments.paperId],
    references: [papers.id],
  }),
  report: one(reports, {
    fields: [attachments.reportId],
    references: [reports.id],
  }),
}));
