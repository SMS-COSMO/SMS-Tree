import { S3 } from '@aws-sdk/client-s3';
import { env } from '../../env';

export const s3 = new S3({
    endpoint: 'https://s3.tebi.io',
    region: 'global',
    credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
});
