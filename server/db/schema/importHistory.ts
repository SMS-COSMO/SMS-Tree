import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { users } from './user';

export const importHistory = sqliteTable('import_history', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  importer: text('importer').references(() => users.id, { onDelete: 'set null', onUpdate: 'set null' }),
  data: text('data', { mode: 'json' }).notNull().$type<{
    classId: number;
    name: string;
    passwords: {
      username: string;
      schoolId: string;
      password: string;
    }[];
    success: boolean;
  }[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const importHistoryRelations = relations(importHistory, ({ one }) => ({
  importer: one(users, {
    fields: [importHistory.importer],
    references: [users.id],
  }),
}));
