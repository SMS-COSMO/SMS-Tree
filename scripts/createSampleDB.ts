import * as readline from 'node:readline/promises';
import process from 'node:process';

import { eq } from 'drizzle-orm';
import cnLorem from 'cn-lorem-ipsum';
import { ctl } from '~/server/trpc/context';
import { env } from '~/server/env';
import { db } from '~/server/db/db';
import { users } from '~/server/db/schema/user';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ans = await rl.question(`Make changes to ${env.DATABASE_URL}? [Y/n]\n`);
if (ans === 'n' || ans === 'N')
  process.exit(0);

const pwd = await rl.question('? Password(default: 12345678): ') || '12345678';

await ctl.uc.register({
  schoolId: 'admin',
  username: 'admin',
  password: pwd,
  role: 'admin',
  initialPassword: false,
});

await ctl.uc.register({
  schoolId: 'student',
  username: 'student',
  password: pwd,
  role: 'student',
  initialPassword: false,
});

const admin = (await db.select().from(users).where(eq(users.schoolId, 'admin')))[0];
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
      username: cnLorem.name(),
      password: pwd,
      role: 'student',
    });
  }).concat(
    [...Array(classCount)].map((_, i) => {
      return ctl.uc.register({
        schoolId: `TeacherSchoolId${i}`,
        username: `教师 ${cnLorem.name()}`,
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

const studentList = await ctl.uc.list('student', true);
const teacherList = await ctl.uc.list('teacher', true);
const sepStudentList = splitToNChunks(studentList, classCount);

await Promise.all(
  [...Array(classCount)].map((_, i) => {
    return ctl.cc.create({
      enterYear: (new Date()).getFullYear() - (Math.round(Math.random() * 10) % 5),
      index: Math.round(Math.random() * 100) % 30,
      state: 'initialized',
      students: sepStudentList[i].map(u => u.id),
      teacherId: teacherList[i].id,
      stateTimetable: [new Date(), new Date(), new Date(), new Date(), new Date()],
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
      .map(({ value }) => value)),
    classGroupCount,
  );

  await Promise.all(
    [...Array(classGroupCount)].map((_, j) => {
      return ctl.gc.create({
        enterYear: c.enterYear,
        classId: c.id,
        members: shuffled[j].map(x => x.id),
        leader: shuffled[j][0].id,
        projectName: cnLorem.phrase({ min: 10, max: 20 }),
      });
    }),
  );
}

const groupList = await ctl.gc.list(admin);
const paperCountInput = Number(await rl.question('? Number of papers to create(default 20): '));
const paperCount = paperCountInput <= 0 ? 20 : paperCountInput;
await Promise.all(
  [...Array(paperCount)].map((_) => {
    return ctl.pc.create({
      abstract: cnLorem.article({ len: 600 }),
      title: cnLorem.phrase({ min: 15, max: 30 }),
      category: Math.round(Math.random() * 20),
      keywords: [...Array(5)].map(_ => cnLorem.phrase({ min: 3, max: 8 })),
      canDownload: Math.random() < 0.5,
      isFeatured: Math.random() < 0.3,
      isPublic: true,
      groupId: groupList[Math.abs(Math.round(Math.random() * groupList.length) - 1)].id,
    });
  }),
);

process.exit(0);
