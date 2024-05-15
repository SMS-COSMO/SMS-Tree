import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { TRPCPanelMeta } from 'trpc-panel';
import { ZodError } from 'zod';
import type { Context } from './context';
import { localizeError } from './utils/zod';

const t = initTRPC
  .context<Context>()
  .meta<TRPCPanelMeta>()
  .create({
    transformer: superjson,
    errorFormatter(opts) {
      const { shape, error } = opts;

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
              ? error.cause.errors.map((x) => {
                const { message, ...rest } = x;
                return {
                  // only replace strings without Chinese characters
                  // silly, but it works lol
                  message: /[\u4E00-\u9FA5]+/.test(message) ? message : localizeError(x).message,
                  ...rest,
                };
              })
              : null,
        },
      };
    },
  });

export const router = t.router;
export const middleware = t.middleware;

export const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户未登录' });

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export function requireRoles(roles: string[]) {
  // `unstable_` means this is a new API but it's safe to use
  //  @see https://trpc.io/docs/server/middlewares#extending-middlewares
  return enforceUserIsAuthed.unstable_pipe(({ ctx, next }) => {
    if (!roles.includes(ctx.user.role))
      throw new TRPCError({ code: 'FORBIDDEN', message: '超出权限范围' });
    return next({
      ctx: {
        user: ctx.user,
      },
    });
  });
}

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
