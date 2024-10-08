import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { TRPCPanelMeta } from 'trpc-panel';
import { ZodError } from 'zod';
import { consola } from 'consola';
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
  else if (ctx.user === 'ERR_JWT_EXPIRED')
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '登录已过期' });

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

export const requireSeiueLoggedIn = t.middleware(({ ctx, next }) => {
  if (!ctx.seiueToken || !ctx.seiueReflectionId)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '请登录希悦' });
  return next({
    ctx: {
      seiueToken: ctx.seiueToken,
      seiueReflectionId: ctx.seiueReflectionId,
    },
  });
});

export const loggedProcedure = t.procedure.use(async (opts) => {
  const start = new Date();
  const result = await opts.next();
  const durationMs = Date.now() - start.getTime();

  try {
    const user = opts.ctx.user === 'ERR_JWT_EXPIRED' ? undefined : opts.ctx.user;
    let input = JSON.stringify(opts.rawInput);
    if (input?.includes('password') || input?.includes('Password'))
      input = '***';

    consola.log(
      start.toLocaleString('zh-CN'),
      '|',
      `[${result.ok ? 'ok' : 'error'}]`,
      `[${opts.type}]`,
      `[${durationMs}ms]`,
      opts.path,
      '->',
      input,
      '|',
      user?.role,
      user?.id,
    );
  } catch {}

  return result;
});

export const publicProcedure = loggedProcedure;
export const protectedProcedure = loggedProcedure.use(enforceUserIsAuthed);
