import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserProfileOutput = RouterOutput['user']['profile'];
export type TUserListOutput = RouterOutput['user']['list'];
export type TUserListOutputItem = RouterOutput['user']['list'][0];

export type TPaperContentOutput = RouterOutput['paper']['content'];
export type TPaperContentWithAuthorOutput = RouterOutput['paper']['contentWithAuthor'];
export type TPaperListOutput = RouterOutput['paper']['list'];
export type TPaperListOutputItem = RouterOutput['paper']['list'][0];
export type TPaperListWithAuthorOutput = RouterOutput['paper']['listWithAuthor'];
export type TPaperListWithAuthorOutputItem = RouterOutput['paper']['listWithAuthor'][0];
export type TCreatePaperInput = RouterInput['paper']['create'];

export type TRegisterInput = RouterInput['user']['register'];

export type TClassContentOutput = RouterOutput['class']['content'];
export type TClassListOutput = RouterOutput['class']['list'];
export type TCreateClassInput = RouterInput['class']['create'];
