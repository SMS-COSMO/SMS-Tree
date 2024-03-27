import process from 'node:process';
import type * as trpcExpress from '@trpc/server/adapters/express';
import type { inferAsyncReturnType } from '@trpc/server';
import { type TRawUser, db } from '../db/db';
import { UserController } from './controllers/user';
import { S3Controller } from './controllers/s3';
import { PaperController } from './controllers/paper';
import { GroupController } from './controllers/group';
import { ClassController } from './controllers/class';
import { AttachmentController } from './controllers/attachment';
import { NoteController } from './controllers/note';

const newGlobal = globalThis as unknown as {
  userController: UserController | undefined;
  noteController: NoteController | undefined;
  paperController: PaperController | undefined;
  groupController: GroupController | undefined;
  classController: ClassController | undefined;
  attachmentController: AttachmentController | undefined;
  s3Controller: S3Controller | undefined;
};

const userController = newGlobal.userController ?? new UserController();
const noteController = newGlobal.noteController ?? new NoteController();
const paperController = newGlobal.paperController ?? new PaperController();
const groupController = newGlobal.groupController ?? new GroupController();
const classController = newGlobal.classController ?? new ClassController();
const attachmentController = newGlobal.attachmentController ?? new AttachmentController();
const s3Controller = new S3Controller();

if (process.env.NODE_ENV !== 'production') {
  newGlobal.userController = userController;
  newGlobal.noteController = noteController;
  newGlobal.paperController = paperController;
  newGlobal.groupController = groupController;
  newGlobal.classController = classController;
  newGlobal.attachmentController = attachmentController;
  newGlobal.s3Controller = s3Controller;
}

interface CreateContextOptions {
  user?: TRawUser;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 * @credits https://create.t3.gg/en/usage/trpc#-servertrpccontextts'
 */
export function createInnerContext(opts: CreateContextOptions) {
  return {
    user: opts.user,
    db,
    s3Controller,
    userController,
    noteController,
    paperController,
    groupController,
    classController,
    attachmentController,
  };
}

export const ctl = {
  uc: userController,
  nc: noteController,
  pc: paperController,
  gc: groupController,
  cc: classController,
  ac: attachmentController,
  s3: s3Controller,
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: trpcExpress.CreateExpressContextOptions) {
  const { req } = opts;
  const user = await userController.getUserFromHeader(req);
  return createInnerContext({ user });
}

export type Context = inferAsyncReturnType<typeof createContext>;
