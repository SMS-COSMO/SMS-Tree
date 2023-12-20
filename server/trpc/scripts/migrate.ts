import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { env } from '../../env';

const options = (() => {
    switch (env.DATABASE_CONNECTION_TYPE) {
    case 'local': return { url: 'file:local.sqlite' };
    case 'remote': return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
    }
})();

const client = createClient(options);
await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
console.log('Migration completed!');
client.close();
