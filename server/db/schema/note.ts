import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';
import { attachments } from './attachment';

export const notes = pgTable('notes', {
  id: text('id').primaryKey().$defaultFn(() => makeId(12)),
  title: text('title').notNull(),
  time: timestamp('time').notNull().defaultNow(),
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  followUp: text('follow_up').notNull(), // 上次活动跟进
  newDiscussion: text('new_discussion').notNull(), // 新的讨论内容
  content: text('content').notNull(), // 活动笔记
  plans: text('plans').notNull(), // 下次活动计划
  reflections: text('reflections').notNull(), // 反思
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const notesRelations = relations(notes, ({ one, many }) => ({
  group: one(groups, {
    fields: [notes.groupId],
    references: [groups.id],
  }),
  attachments: many(attachments),
}));
