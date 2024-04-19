import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { customAlphabet } from 'nanoid';
import type { TRawClass } from '~/server/db/db';

export const TRPCForbidden = new TRPCError({ code: 'FORBIDDEN', message: '超出权限范围' });
export async function useTry<T>(
  handler: () => Promise<T>,
  opts?: {
    message?: string;
    cause?: unknown;
    code: TRPC_ERROR_CODE_KEY;
  },
) {
  try {
    return await handler();
  } catch (err) {
    // TODO: detailed db error handling
    throw new TRPCError(opts ?? { code: 'INTERNAL_SERVER_ERROR' });
  }
}

export const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

export function getClassName(classInfo: TRawClass | undefined) {
  if (!classInfo)
    return '未知';

  const now = new Date();
  const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${year < 4 ? ['新高一', '高一', '高二', '高三'][year] : `${classInfo.enterYear}届`}（${classInfo.index}）`;
}
