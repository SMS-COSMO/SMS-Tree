import { defineConfig } from 'drizzle-kit';
import { env } from './server/env';

const dbCredentials = (() => {
  switch (env.DATABASE_CONNECTION_TYPE) {
    case 'local': return { url: env.DATABASE_URL };
    case 'remote': return { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN };
  }
})();

export default defineConfig({
  dialect: 'sqlite',
  out: './drizzle',
  schema: './server/db/schema/*',
  driver: 'turso',
  dbCredentials,
});
