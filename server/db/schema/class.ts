import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { makeId } from '../../trpc/utils/shared';

export const classes = sqliteTable('classes', {
  id: text('id', { mode: 'text' }).primaryKey().$defaultFn(() => makeId(12)),
  index: integer('index', { mode: 'number' }).notNull(),
  enterYear: integer('enter_year', { mode: 'number' }).notNull(),
  state: text('state', { enum: [
    'initialized', // 初始化
    'selectGroup', // 选择小组
    'thesisProposal', // 开题报告
    'concludingReport', // 结题报告
    'submitPaper', // 提交论文
    'archived', // 归档
  ] }).notNull().default('initialized'),
});
