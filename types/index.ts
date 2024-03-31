import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserLogin = RouterOutput['user']['login'];
export type TUserProfile = RouterOutput['user']['profile'];
export type TUserList = RouterOutput['user']['list'];
export type TUserListItem = RouterOutput['user']['list'][0];
export type TUserRegister = RouterInput['user']['register'];

export type TPaperContent = RouterOutput['paper']['info'];
export type TPaperListSafe = RouterOutput['paper']['listSafe'];
export type TPaperListSafeItem = RouterOutput['paper']['listSafe'][0];
export type TPaperCreate = RouterInput['paper']['create'];
export type TPaperCreateSafe = RouterInput['paper']['createSafe'];
export type TPaperCreateForm = TPaperCreate & { paperFile: string[]; attachments: string[] };
export type TPaperCreateSafeForm = TPaperCreateSafe & { paperFile: string[]; attachments: string[] };

export type TClassContent = RouterOutput['class']['content'];
export type TClassList = RouterOutput['class']['list'];
export type TClassListItem = RouterOutput['class']['list'][0];
export type TClassCreate = RouterInput['class']['create'];

export type TAttachmentList = RouterOutput['paper']['attachments'];
export type TAttachmentListItem = RouterOutput['paper']['attachments'][0];
export type TAttachmentCreate = RouterInput['attachment']['create'];
export type TAttachmentModify = RouterInput['attachment']['modify'];
export type TAttachmentContent = TAttachmentListItem;
export type TAttachmentCategory = 'paperDocument' | 'paperAttachment' | 'reportDocument' | 'reportPresentation';

export type TReportCategory = 'thesisProposal' | 'concludingReport';

export type TRole = 'student' | 'teacher' | 'admin';
export type TClassState =
  'initialized' |
  'selectGroup' |
  'thesisProposal' |
  'concludingReport' |
  'submitPaper' |
  'archived';

export type TGroupContent = RouterOutput['group']['content'];
export type TGroupList = RouterOutput['group']['list'];

export type TNoteInfo = RouterOutput['note']['info'];
export type TNoteCreateSafe = RouterInput['note']['createSafe'];
