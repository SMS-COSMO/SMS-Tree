import { TRPCError } from '@trpc/server';

/**
 * Represents a result with an optional value and an associated message.
 */
export class Result<T> {
  ok: boolean;
  msg: string;
  res?: T;

  /**
   * Creates a new instance of the Result class.
   *
   * Use {@link ResultNoRes} instead if the result value is undefined.
   *
   *
   * @param ok - Indicates whether the result is successful or not.
   * @param msg - The message associated with the result.
   * @param res - The result value.
   */
  constructor(ok: boolean, msg: string, res: T) {
    this.ok = ok;
    this.msg = msg;
    this.res = res;
  }

  /**
   * Gets the message associated with the result or throws a TRPCError.
   * @param code - The error code to use if the result is not ok.
   * @returns The message associated with the result.
   * @throws TRPCError if the result is not ok.
   */
  getMsgOrTRPCError(code: TRPCError['code'] = 'BAD_REQUEST') {
    if (!this.ok)
      throw new TRPCError({ code, message: this.msg });
    return this.msg;
  }

  /**
   * Gets the result value or throws a TRPCError.
   * @param code - The error code to use if the result is not ok or the result value is undefined.
   * @returns The result value.
   * @throws TRPCError if the result is not ok or the result value is undefined.
   */
  getResOrTRPCError(code: TRPCError['code'] = 'BAD_REQUEST') {
    if (!this.ok || this.res === undefined)
      throw new TRPCError({ code, message: this.msg });
    return this.res;
  }
};

/**
 * Represents a result with no response data.
 * Inherits from the base {@link Result} class.
 */
export class ResultNoRes extends Result<undefined> {
  constructor(ok: boolean, msg: string) {
    super(ok, msg, undefined);
  }
}

export class Result500 extends ResultNoRes {
  constructor() {
    super(false, '服务器内部错误');
  };
};
