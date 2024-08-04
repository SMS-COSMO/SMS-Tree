import { json, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { users } from './user';

export const importHistory = pgTable('import_history', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  importer: text('importer').references(() => users.id, { onDelete: 'set null', onUpdate: 'set null' }),
  data: json('data').notNull().$type<{
    classId: number;
    name: string;
    passwords: {
      username: string;
      schoolId: string;
      password: string;
    }[];
    success: boolean;
  }[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const importHistoryRelations = relations(importHistory, ({ one }) => ({
  importer: one(users, {
    fields: [importHistory.importer],
    references: [users.id],
  }),
}));
