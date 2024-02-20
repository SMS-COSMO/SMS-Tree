import * as readline from 'node:readline/promises';
import process from 'node:process';
import { nanoid } from 'nanoid';

import { UserController } from '~/server/trpc/controllers/user';
import { ClassController } from '~/server/trpc/controllers/class';
import { GroupController } from '~/server/trpc/controllers/group';
import { PaperController } from '~/server/trpc/controllers/paper';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const uc = new UserController();
const cc = new ClassController();
const gc = new GroupController();
const pc = new PaperController();

const defaultPwd = await rl.question('? Default password: ');
await uc.register({
  id: 'admin',
  username: 'admin',
  password: defaultPwd,
  role: 'admin',
});

const studentCount = Number(await rl.question('? Number of students to create: '));
const classCount = Number(await rl.question('? Number of classes to create: '));

await Promise.all(
  [...Array(studentCount)].map((_, i) => {
    return uc.register({
      id: `Student${i}`,
      username: `Student${i}`,
      password: defaultPwd,
      role: 'student',
    });
  }).concat(
    [...Array(classCount)].map((_, i) => {
      return uc.register({
        id: `Teacher${i}`,
        username: `Teacher${i}`,
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

const studentList = (await uc.getList('student')).getResOrTRPCError();
const teacherList = (await uc.getList('teacher')).getResOrTRPCError();
const sepStudentList = splitToNChunks(studentList, classCount);

await Promise.all(
  [...Array(classCount)].map((_, i) => {
    return cc.create({
      enterYear: 2022,
      index: Math.round(Math.random() * 100) % 30,
      state: 'initialized',
      students: sepStudentList[i].map(u => u.id),
      teacher: teacherList[i].id,
    });
  }),
);

const classList = (await cc.getList()).getResOrTRPCError();

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
        return gc.create({
          classId: c.id,
          members: shuffled[j],
          leader: shuffled[j][0],
          projectName: `project ${i}${j}`,
        });
      }),
    );
  }),
);

const groupList = (await gc.getList()).getResOrTRPCError();

const paperCount = Number(await rl.question('? Number of papers to create: '));
await Promise.all(
  [...Array(paperCount)].map((_, i) => {
    return pc.create({
      abstract: nanoid(100),
      title: `Paper ${i}`,
      keywords: [...Array(5)].map(_ => nanoid(5)),
      canDownload: Math.random() < 0.5,
      isFeatured: Math.random() < 0.3,
      rate: Math.round(Math.random() * 100),
      groupId: groupList[Math.abs(Math.round(Math.random() * groupList.length) - 1)].id,
    });
  }),
);

process.exit(0);
