import * as readline from 'node:readline/promises';
import process from 'node:process';
import { nanoid } from 'nanoid';

import { eq } from 'drizzle-orm';
import { ctl } from '~/server/trpc/context';
import { env } from '~/server/env';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema/user';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ans = await rl.question(`Make changes to ${env.DATABASE_CONNECTION_TYPE} - ${env.DATABASE_URL}? [y/n]\n`);
if (ans === 'n' || ans === 'N')
  process.exit(0);

const defaultPwd = await rl.question('? Default password: ');
await ctl.uc.register({
  id: 'admin',
  username: 'admin',
  password: defaultPwd,
  role: 'admin',
});
const admin = await db.select().from(users).where(eq(users.id, 'admin')).get();
if (!admin)
  process.exit(0);

const studentCount = Number(await rl.question('? Number of students to create: '));
const classCount = Number(await rl.question('? Number of classes to create: '));

await Promise.all(
  [...Array(studentCount)].map((_, i) => {
    return ctl.uc.register({
      id: `StudentID${i}`,
      username: `StudentName${i}`,
      password: defaultPwd,
      role: 'student',
    });
  }).concat(
    [...Array(classCount)].map((_, i) => {
      return ctl.uc.register({
        id: `TeacherID${i}`,
        username: `TeacherName${i}`,
        password: defaultPwd,
        role: 'teacher',
      });
    }),
  ),
);

function splitToNChunks<T>(array: T[], n: number) {
  const result: T[][] = [];
  for (let i = n; i > 0; i--)
    result.push(array.splice(0, Math.ceil(array.length / i)));

  return result;
}

const studentList = await ctl.uc.getList('student');
const teacherList = await ctl.uc.getList('teacher');
const sepStudentList = splitToNChunks(studentList, classCount);

await Promise.all(
  [...Array(classCount)].map((_, i) => {
    return ctl.cc.create({
      enterYear: 2022,
      index: Math.round(Math.random() * 100) % 30,
      state: 'initialized',
      students: sepStudentList[i].map(u => u.id),
      teacher: teacherList[i].id,
    });
  }),
);

const classList = await ctl.cc.getList();

const groupCount = Number(await rl.question('? Number of groups (per class) to create: '));
await Promise.all(
  [...Array(classCount)].map((_, i) => {
    const c = classList[i];
    const classGroupCount = Math.round(c.students.length / groupCount);
    const shuffled = splitToNChunks(
      (c.students
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)), classGroupCount);

    return Promise.all(
      [...Array(classGroupCount)].map((_, j) => {
        return ctl.gc.create({
          classId: c.id,
          members: shuffled[j],
          leader: shuffled[j][0],
          projectName: `project ${i}${j}`,
        });
      }),
    );
  }),
);

const groupList = await ctl.gc.getList(admin);

function getScore() {
  const possible: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  return possible[Math.round((Math.random() * 100)) % 4];
}

const paperCount = Number(await rl.question('? Number of papers to create: '));
await Promise.all(
  [...Array(paperCount)].map((_, i) => {
    return ctl.pc.create({
      abstract: nanoid(100),
      title: `Paper ${i}`,
      category: Math.round(Math.random() * 100),
      keywords: [...Array(5)].map(_ => nanoid(5)),
      canDownload: Math.random() < 0.5,
      isFeatured: Math.random() < 0.3,
      isPublic: true,
      score: getScore(),
      groupId: groupList[Math.abs(Math.round(Math.random() * groupList.length) - 1)].id,
    });
  }),
);

process.exit(0);
