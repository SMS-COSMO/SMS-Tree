import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { protectedProcedure, requireRoles, requireSeiueLoggedIn, router } from '../trpc';
import { Seiue, SeiueDataHelper } from '../utils/seiue';
import { db } from '~/server/db/db';
import { classesToStudents } from '~/server/db/schema/classToStudents';
import { users } from '~/server/db/schema/user';
import { classes } from '~/server/db/schema/class';

// everything here should be admin/teacher only
export const seiueRouter = router({
  login: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      schoolId: z.string().min(1).max(20),
      password: z.string().min(1).max(200), // who will have a 200-character password?
    }))
    .mutation(async ({ input }) => {
      const loginRes = await Seiue.login({
        schoolId: input.schoolId,
        password: input.password,
      });
      if (!loginRes)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });
      return loginRes;
    }),

  token: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .input(z.object({
      cookies: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      return await Seiue.retrieveToken(input.cookies);
    }),

  me: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .use(requireSeiueLoggedIn)
    .query(async ({ ctx }) => {
      if (!ctx.seiueToken)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '请登陆希悦' });
      return await Seiue.me(ctx.seiueToken);
    }),

  semesters: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .use(requireSeiueLoggedIn)
    .query(async ({ ctx }) => {
      const seiue = new Seiue({ accessToken: ctx.seiueToken, activeReflectionId: ctx.seiueReflectionId });
      const dataHelper = new SeiueDataHelper(seiue);
      return await dataHelper.fetchSemesters();
    }),

  classList: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .use(requireSeiueLoggedIn)
    .input(z.object({
      semesterId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const seiue = new Seiue({ accessToken: ctx.seiueToken, activeReflectionId: ctx.seiueReflectionId });
      const dataHelper = new SeiueDataHelper(seiue);
      return await dataHelper.fetchClassList(input.semesterId);
    }),

  classMembers: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .use(requireSeiueLoggedIn)
    .input(z.object({
      classId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const seiue = new Seiue({ accessToken: ctx.seiueToken, activeReflectionId: ctx.seiueReflectionId });
      const dataHelper = new SeiueDataHelper(seiue);
      return await dataHelper.fetchClassMembers(input.classId);
    }),

  importData: protectedProcedure
    .use(requireRoles(['admin', 'teacher']))
    .use(requireSeiueLoggedIn)
    .input(z.object({ classId: z.number(), name: z.string() }).array())
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0)
        throw new TRPCError({ code: 'BAD_REQUEST', message: '请至少选择一个班级' });

      const seiue = new Seiue({ accessToken: ctx.seiueToken, activeReflectionId: ctx.seiueReflectionId });
      const dataHelper = new SeiueDataHelper(seiue);
      const promiseArray: Promise<{ classId: number; name: string; success: boolean }>[] = [];
      const classId2Name = Object.fromEntries(input.map(item => [item.classId, item.name])) as Record<number, string>;
      const classIds = Object.keys(classId2Name) as unknown as number[];
      for (const classId of classIds) {
        const classMembers = await dataHelper.fetchClassMembers(classId);
        const transactionPromise = db.transaction(async (trx) => {
          try {
            // we assume that all the members are in the same class
            const classEnterYear = Number.parseInt(classMembers[0].reflection.graduates_in.name.slice(0, -1));
            const classIndex = Number.parseInt(classMembers[0].reflection.admin_classes[0].slice(0, -1));

            // 1. create new class
            const newClass = await trx.insert(classes).values({
              index: classIndex,
              enterYear: classEnterYear,
              teacherId: ctx.user.id,
              state: 'initialized',
              stateTimetable: [],
            }).returning().get();

            // 2. update class <-> student relations (will create new students if necessary)
            for (const member of classMembers) {
              const existingStudent = await trx.query.users.findFirst({ where: eq(users.schoolId, member.reflection.usin) });
              if (existingStudent) {
              // delete existing class <-> student relations
                await trx.delete(classesToStudents).where(eq(classesToStudents.userId, existingStudent.id));
                await trx.insert(classesToStudents).values({
                  classId: newClass.id,
                  userId: existingStudent.id,
                });
              } else {
              // create a new student
                const newStudent = await trx.insert(users).values({
                  username: member.reflection.name,
                  schoolId: member.reflection.usin,
                  password: '', // TODO: generate a random password
                  role: 'student',
                }).returning().get();
                await trx.insert(classesToStudents).values({
                  classId: newClass.id,
                  userId: newStudent.id,
                });
              }
            }
            return { classId, name: classId2Name[classId], success: true };
          } catch {
            trx.rollback();
            return { classId, name: classId2Name[classId], success: false };
          }
        });
        promiseArray.push(transactionPromise);
      }
      return await Promise.all(promiseArray);
    }),
});
