import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserLogin = RouterOutput['user']['login'];
export type TUserProfile = RouterOutput['user']['profile'];
export type TUserList = RouterOutput['user']['list'];
export type TUserListItem = RouterOutput['user']['list'][0];
export type TUserRegister = RouterInput['user']['register'];

export type TPaperContent = RouterOutput['paper']['content'];
export type TPaperContentWithAuthor = RouterOutput['paper']['contentWithAuthor'];
export type TPaperList = RouterOutput['paper']['list'];
export type TPaperListItem = RouterOutput['paper']['list'][0];
export type TPaperListWithAuthor = RouterOutput['paper']['listWithAuthor'];
export type TPaperListWithAuthorItem = RouterOutput['paper']['listWithAuthor'][0];
export type TPaperCreate = RouterInput['paper']['create'];

export type TClassContent = RouterOutput['class']['content'];
export type TClassList = RouterOutput['class']['list'];
export type TClassListItem = RouterOutput['class']['list'][0];
export type TClassCreate = RouterInput['class']['create'];

export type TAttachmentList = RouterOutput['paper']['attachments'];
export type TAttachmentListItem = RouterOutput['paper']['attachments'][0];
export type TAttachmentCreate = RouterInput['attachment']['create'];
export type TAttachmentContent = TAttachmentListItem;

export type TRole = 'student' | 'teacher' | 'admin';

export type TGroupList = RouterOutput['group']['list'];
