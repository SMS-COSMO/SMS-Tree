import { TRPCError } from '@trpc/server';
import { customAlphabet } from 'nanoid';

export const TRPCForbidden = new TRPCError({ code: 'FORBIDDEN', message: '超出权限范围' });
export const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
