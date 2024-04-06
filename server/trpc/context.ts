import process from 'node:process';
import type { H3Event } from 'h3';
import type { inferAsyncReturnType } from '@trpc/server';
import { type TRawUser, db } from '../db/db';
import { UserController } from './controllers/user';
import { S3Controller } from './controllers/s3';
import { PaperController } from './controllers/paper';
import { GroupController } from './controllers/group';
import { ClassController } from './controllers/class';
import { AttachmentController } from './controllers/attachment';
import { NoteController } from './controllers/note';
import { ReportController } from './controllers/report';

const newGlobal = globalThis as unknown as {
  s3Controller: S3Controller | undefined;
  userController: UserController | undefined;
  noteController: NoteController | undefined;
  paperController: PaperController | undefined;
  groupController: GroupController | undefined;
  classController: ClassController | undefined;
  reportController: ReportController | undefined;
  attachmentController: AttachmentController | undefined;
};

const s3Controller = new S3Controller();
const userController = newGlobal.userController ?? new UserController();
const noteController = newGlobal.noteController ?? new NoteController();
const paperController = newGlobal.paperController ?? new PaperController();
const groupController = newGlobal.groupController ?? new GroupController();
const classController = newGlobal.classController ?? new ClassController();
const reportController = newGlobal.reportController ?? new ReportController();
const attachmentController = newGlobal.attachmentController ?? new AttachmentController();

if (process.env.NODE_ENV !== 'production') {
  newGlobal.s3Controller = s3Controller;
  newGlobal.userController = userController;
  newGlobal.noteController = noteController;
  newGlobal.paperController = paperController;
  newGlobal.groupController = groupController;
  newGlobal.classController = classController;
  newGlobal.reportController = reportController;
  newGlobal.attachmentController = attachmentController;
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
    db,
    user: opts.user,
    s3Controller,
    userController,
    noteController,
    paperController,
    groupController,
    classController,
    reportController,
    attachmentController,
  };
}

export const ctl = {
  s3: s3Controller,
  uc: userController,
  nc: noteController,
  pc: paperController,
  gc: groupController,
  cc: classController,
  rc: reportController,
  ac: attachmentController,
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export async function createContext(event: H3Event) {
  const header = getRequestHeader(event, 'Authorization');
  const user = await userController.getUserFromHeader(header);
  return createInnerContext({ user });
}

export type Context = inferAsyncReturnType<typeof createContext>;
