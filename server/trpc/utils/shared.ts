import { TRPCError } from '@trpc/server';

/**
 * Checks if two values are equal and throws an error if they are not.
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @param message - The error message to throw if the values are not equal.
 * @param code - The error code to use when throwing the error. Defaults to 'BAD_REQUEST'.
 * @throws {TRPCError} - Throws a TRPCError if the values are not equal.
 */
export function requireEqualOrThrow(a: any, b: any, message: string, code: TRPCError['code'] = 'BAD_REQUEST') {
  if (a !== b)
    throw new TRPCError({ code, message });
}
