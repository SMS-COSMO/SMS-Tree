import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserProfileOutput = RouterOutput['user']['profile'];
export type TUserStudentListOutput = RouterOutput['user']['studentList'];
export type TPaperContentOutput = RouterOutput['paper']['content'];
export type TPaperListOutput = RouterOutput['paper']['list'];
export type TPaperListOutputItem = RouterOutput['paper']['list'][0];
export type TCreatePaperInput = RouterInput['paper']['create'];
export type TRegisterInput = RouterInput['user']['register'];