import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { customAlphabet } from 'nanoid';

export function requireEqualOrThrow(
  a: any,
  b: any,
  opts?: {
    message?: string;
    cause?: unknown;
    code: TRPC_ERROR_CODE_KEY;
  },
) {
  if (a !== b)
    throw new TRPCError(opts ?? { code: 'FORBIDDEN' });
}

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
