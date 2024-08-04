import { defineConfig } from 'drizzle-kit';
import { env } from './server/env';

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './server/db/schema/*',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
