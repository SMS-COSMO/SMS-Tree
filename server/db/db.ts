import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '../env';
import type { refreshTokens, users } from './schema/user';
import type { papers } from './schema/paper';
import type { groups } from './schema/group';
import type { classes } from './schema/class';
import type { attachments } from './schema/attachment';
import type { notes } from './schema/note';

const options = (() => {
  switch (env.DATABASE_CONNECTION_TYPE) {
    case 'local': return { url: env.DATABASE_URL };
    case 'remote': return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
  }
})();

const client = createClient(options);
export const db = drizzle(client);

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
