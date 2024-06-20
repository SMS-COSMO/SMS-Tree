import process from 'node:process';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_CONNECTION_TYPE: z.enum(['remote', 'local']),
  DATABASE_AUTH_TOKEN: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  TOKEN_EXPIRATION_TIME: z.string().optional().default('24h'),
  SIGN_PUBLIC_KEY: z.string(),
  SIGN_PRIVATE_KEY: z.string(),
  ENC_PUBLIC_KEY: z.string(),
  ENC_PRIVATE_KEY: z.string(),
  SIGN_KID: z.string(),
  ENC_KID: z.string(),
  S3_SERVER_URL: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  BUCKET_NAME: z.string(),
  SERVER_URL: z.string(),
  SEIUE_SCHOOL_ID: z.coerce.number().default(282),
  SEIUE_LOGIN: z.enum(['true', 'false']).default('true').transform(value => value === 'true'),
  SEIUE_API_URL: z.string().default('https://api.seiue.com'),
  SEIUE_OPEN_API_URL: z.string().default('https://open.seiue.com/api'),
  SEIUE_CHALK_URL: z.string().default('https://chalk.seiue.com'),
  SEIUE_PASSPORT_URL: z.string().default('https://passport.seiue.com'),
  SEIUE_IMPORT_FILTER_KEY: z.string().default('综合实践'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('[ERROR] Invalid environment variables:', JSON.stringify(envParse.error.format(), null, 4));
  process.exit(1);
}
export const env = envParse.data;
