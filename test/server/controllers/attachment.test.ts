import { expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../mockDb';
import * as exports from '../../../server/db/db';
import { ctl } from './controllers';
import { users } from '~/server/db/schema/user';

it('hasPerm', async () => {
  vi.spyOn(exports, 'db', 'get').mockReturnValue(db);

  /*
  attachment:
  {
    "id": "XTaCBHI_LgAC",
    "name": "attachment1.docx",
    "paper_id": "KJczhKMCn4Iu",
    "is_main_file": true,
    "file_type": "application/msword",
    "s3_file_id": "mock_file_url",
    "_id": "623349e4-7434-4d7f-a63b-5dad9489f716"
  }
  */

  const student57 = (await db.select().from(users).where(eq(users.id, 'Student57')))[0];
  const student0 = (await db.select().from(users).where(eq(users.id, 'Student0')))[0];
  const student91 = (await db.select().from(users).where(eq(users.id, 'Student91')))[0];
  const admin = (await db.select().from(users).where(eq(users.id, 'admin')))[0];
  const teacher0 = (await db.select().from(users).where(eq(users.id, 'Teacher0')))[0];

  expect(await ctl.ac.hasPerm('KJczhKMCn4Iu', student57)).toBe(true); // Leader
  expect(await ctl.ac.hasPerm('KJczhKMCn4Iu', student91)).toBe(true); // Member
  expect(await ctl.ac.hasPerm('KJczhKMCn4Iu', admin)).toBe(true);
  expect(await ctl.ac.hasPerm('KJczhKMCn4Iu', teacher0)).toBe(true);

  expect(await ctl.ac.hasPerm('KJczhKMCn4Iu', student0)).toBe(false); // Outside student

  // test empty
  expect(await ctl.ac.hasPerm('', student0)).toBe(true);
  expect(await ctl.ac.hasPerm(undefined, student0)).toBe(true);
  expect(await ctl.ac.hasPerm(null, student0)).toBe(true);
});

it('create', async () => {
  vi.spyOn(exports, 'db', 'get').mockReturnValue(db);

  const student57 = (await db.select().from(users).where(eq(users.id, 'Student57')))[0];
  const student0 = (await db.select().from(users).where(eq(users.id, 'Student0')))[0];
  const admin = (await db.select().from(users).where(eq(users.id, 'admin')))[0];
  const teacher0 = (await db.select().from(users).where(eq(users.id, 'Teacher0')))[0];

  // No paperId
  expect((
    await ctl.ac.create(
      {
        name: 'attachment',
        fileType: 'application/msword',
        S3FileId: 'some url',
      },
      student57,
    )
  ).ok).toBe(true);

  expect((
    await ctl.ac.create({
      name: 'attachment',
      fileType: 'application/msword',
      S3FileId: 'some url',
      paperId: 'KJczhKMCn4Iu',
      isMainFile: true,
    }, student57)
  ).ok).toBe(true);
  expect((
    await ctl.ac.create({
      name: 'attachment',
      fileType: 'application/msword',
      S3FileId: 'some url',
      paperId: 'KJczhKMCn4Iu',
      isMainFile: true,
    }, admin)
  ).ok).toBe(true);
  expect((
    await ctl.ac.create({
      name: 'attachment',
      fileType: 'application/msword',
      S3FileId: 'some url',
      paperId: 'KJczhKMCn4Iu',
      isMainFile: true,
    }, teacher0)
  ).ok).toBe(true);

  expect((
    await ctl.ac.create({
      name: 'attachment',
      fileType: 'application/msword',
      S3FileId: 'some url',
      paperId: 'KJczhKMCn4Iu',
      isMainFile: true,
    }, student0)
  ).ok).toBe(false);
});