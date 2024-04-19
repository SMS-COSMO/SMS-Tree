import * as readline from 'node:readline/promises';
import process from 'node:process';
import { nanoid } from 'nanoid';

import { eq } from 'drizzle-orm';
import { ctl } from '~/server/trpc/context';
import { env } from '~/server/env';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema/user';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ans = await rl.question(`Make changes to ${env.DATABASE_CONNECTION_TYPE} - ${env.DATABASE_URL}? [Y/n]\n`);
if (ans === 'n' || ans === 'N')
  process.exit(0);

const pwd = await rl.question('? Password(default: 12345678): ') || '12345678';
await ctl.uc.register({
  schoolId: 'admin',
  username: 'admin',
  password: pwd,
  role: 'admin',
});

const admin = await db.select().from(users).where(eq(users.schoolId, 'admin')).get();
if (!admin)
  process.exit(0);

const studentCountInput = Number(await rl.question('? Number of students to create(default 100): '));
const studentCount = studentCountInput <= 0 ? 100 : studentCountInput;
const classCountInput = Number(await rl.question('? Number of classes to create(default 5): '));
const classCount = classCountInput <= 0 ? 5 : classCountInput;

await Promise.all(
  [...Array(studentCount)].map((_, i) => {
    return ctl.uc.register({
      schoolId: `StudentSchoolId${i}`,
      username: `StudentName${i}`,
      password: pwd,
      role: 'student',
    });
  }).concat(
    [...Array(classCount)].map((_, i) => {
      return ctl.uc.register({
        schoolId: `TeacherSchoolId${i}`,
        username: `TeacherName${i}`,
        password: pwd,
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

const studentList = await ctl.uc.list('student');
const teacherList = await ctl.uc.list('teacher');
const sepStudentList = splitToNChunks(studentList, classCount);

await Promise.all(
  [...Array(classCount)].map((_, i) => {
    return ctl.cc.create({
      enterYear: (new Date()).getFullYear() - (Math.round(Math.random() * 10) % 5),
      index: Math.round(Math.random() * 100) % 30,
      state: 'initialized',
      students: sepStudentList[i].map(u => u.id),
      teacherId: teacherList[i].id,
    });
  }),
);

const classList = await db.query.classes.findMany({
  columns: {
    id: true,
    enterYear: true,
  },
  with: {
    classesToStudents: {
      columns: {},
      with: {
        users: {
          columns: {
            id: true,
          },
        },
      },
    },
  },
});

const groupCountInput = Number(await rl.question('? Number of groups (per class) to create(default 5): '));

const groupCount = groupCountInput <= 0 ? 5 : groupCountInput;
for (const i in classList) {
  const c = classList[i];
  const classGroupCount = Math.round(c.classesToStudents.length / groupCount);
  const shuffled = splitToNChunks(
    (c.classesToStudents
      .map(value => ({ value: value.users, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)), classGroupCount);

  await Promise.all(
    [...Array(classGroupCount)].map((_, j) => {
      return ctl.gc.create({
        enterYear: c.enterYear,
        classId: c.id,
        members: shuffled[j].map(x => x.id),
        leader: shuffled[j][0].id,
        projectName: `project ${i}${j}`,
      });
    }),
  );
}

function getScore() {
  const possible: TPaperScore[] = ['A', 'B', 'C', 'D'];
  return possible[Math.round((Math.random() * 100)) % 4];
}

const groupList = await ctl.gc.list(admin);
const paperCountInput = Number(await rl.question('? Number of papers to create(default 20): '));
const paperCount = paperCountInput <= 0 ? 20 : paperCountInput;
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
