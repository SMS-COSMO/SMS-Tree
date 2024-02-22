import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:testRuntime.sqlite' });
export const db = drizzle(client);
