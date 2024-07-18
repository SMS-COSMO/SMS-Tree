import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../env';
import type { refreshTokens, users } from './schema/user';
import type { papers } from './schema/paper';
import type { groups } from './schema/group';
import type { classes } from './schema/class';
import type { attachments } from './schema/attachment';
import type { notes } from './schema/note';
import type { reports } from './schema/report';

import * as userSchema from './schema/user';
import * as paperSchema from './schema/paper';
import * as groupSchema from './schema/group';
import * as classSchema from './schema/class';
import * as attachmentSchema from './schema/attachment';
import * as noteSchema from './schema/note';
import * as reportSchema from './schema/report';
import * as userToGroupSchema from './schema/userToGroup';
import * as classToStudentsSchema from './schema/classToStudents';
import * as importHistorySchema from './schema/importHistory';
import * as bookmarkSchema from './schema/bookmark';

const options = (() => {
  switch (env.DATABASE_CONNECTION_TYPE) {
    case 'local': return { url: env.DATABASE_URL };
    case 'remote': return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
  }
})();

const client = createClient(options);
export const db = drizzle(client, {
  schema: {
    ...userSchema,
    ...paperSchema,
    ...groupSchema,
    ...classSchema,
    ...attachmentSchema,
    ...noteSchema,
    ...reportSchema,
    ...userToGroupSchema,
    ...classToStudentsSchema,
    ...importHistorySchema,
    ...bookmarkSchema,
  },
});

export type TRawUser = typeof users.$inferSelect;
export type TNewUser = typeof users.$inferInsert;
export type TRefreshToken = typeof refreshTokens.$inferInsert;

export type TRawPaper = typeof papers.$inferSelect;
export type TNewPaper = typeof papers.$inferInsert;

export type TRawGroup = typeof groups.$inferSelect;
export type TNewGroup = typeof groups.$inferInsert;

export type TRawClass = typeof classes.$inferSelect;
export type TNewClass = typeof classes.$inferInsert;

export type TRawAttachment = typeof attachments.$inferSelect;
export type TNewAttachment = typeof attachments.$inferInsert;

export type TRawNote = typeof notes.$inferSelect;
export type TNewNote = typeof notes.$inferInsert;

export type TRawReport = typeof reports.$inferSelect;
export type TNewReport = typeof reports.$inferInsert;
