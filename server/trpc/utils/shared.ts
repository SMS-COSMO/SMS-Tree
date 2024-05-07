import { TRPCError } from '@trpc/server';
import { customAlphabet } from 'nanoid';
import type { TRawClass } from '~/server/db/db';

export const TRPCForbidden = new TRPCError({ code: 'FORBIDDEN', message: '超出权限范围' });
export const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

export function getClassName(classInfo: Partial<TRawClass> | undefined | null) {
  if (!classInfo || !classInfo.enterYear)
    return '未知';

  const now = new Date();
  const year = now.getFullYear() - classInfo.enterYear + (now.getMonth() > 8 ? 1 : 0);

  return `${year < 4 ? ['新高一', '高一', '高二', '高三'][year] : `${classInfo.enterYear}届`}（${classInfo.index}）`;
}
