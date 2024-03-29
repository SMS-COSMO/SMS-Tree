import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';
import { groups } from './group';

export const notes = sqliteTable('notes', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  title: text('title', { mode: 'text' }).notNull(),
  time: integer('time', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  groupId: text('group_id', { mode: 'text' }).notNull().references(() => groups.id),
  followUp: text('follow_up', { mode: 'text' }).notNull(), // 上次活动跟进
  newDiscussion: text('new_discussion', { mode: 'text' }).notNull(), // 新的讨论内容
  content: text('content', { mode: 'text' }).notNull(), // 活动笔记
  plans: text('plans', { mode: 'text' }).notNull(), // 下次活动计划
  reflections: text('reflections', { mode: 'text' }).notNull(), // 反思
});
