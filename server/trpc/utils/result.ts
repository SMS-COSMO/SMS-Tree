import { TRPCError } from '@trpc/server';

export class Result<T> {
  ok: boolean;
  msg: string;
  res?: T;

  constructor(ok: boolean, msg: string, res?: T) {
    this.ok = ok;
    this.msg = msg;
    this.res = res;
  }

  getMsgOrTRPCError(code: TRPCError['code'] = 'BAD_REQUEST') {
    if (!this.ok)
      throw new TRPCError({ code, message: this.msg });
    return this.msg;
  }

  getResOrTRPCError(code: TRPCError['code'] = 'BAD_REQUEST') {
    if (!this.ok || this.res === undefined)
      throw new TRPCError({ code, message: this.msg });
    return this.res;
  }
};

export class ResultNoRes extends Result<undefined> {
  constructor(ok: boolean, msg: string) {
    super(ok, msg);
  }
}

export class Result500 extends ResultNoRes {
  constructor() {
    super(false, '服务器内部错误');
  };
};
