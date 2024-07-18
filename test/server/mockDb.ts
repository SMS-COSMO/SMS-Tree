import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as userSchema from '../../server/db/schema/user';
import * as paperSchema from '../../server/db/schema/paper';
import * as groupSchema from '../../server/db/schema/group';
import * as classSchema from '../../server/db/schema/class';
import * as attachmentSchema from '../../server/db/schema/attachment';
import * as noteSchema from '../../server/db/schema/note';
import * as reportSchema from '../../server/db/schema/report';
import * as userToGroupSchema from '../../server/db/schema/userToGroup';
import * as classToStudentsSchema from '../../server/db/schema/classToStudents';
import * as importHistorySchema from '../../server/db/schema/importHistory';
import * as bookmarkSchema from '../../server/db/schema/bookmark';

const client = createClient({ url: 'file:testRuntime.sqlite' });
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
