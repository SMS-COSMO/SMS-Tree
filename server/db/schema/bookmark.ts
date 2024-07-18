import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './user';
import { papers } from './paper';

export const bookmarks = sqliteTable('bookmarks', {
  paperId: text('paper_id').notNull().references(() => papers.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, t => ({
  pk: primaryKey({ columns: [t.paperId, t.userId] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  papers: one(papers, {
    fields: [bookmarks.paperId],
    references: [papers.id],
  }),
  users: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
}));
