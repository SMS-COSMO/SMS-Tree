import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/trpc/routers';

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;

export type TUserLogin = RouterOutput['user']['login'];
export type TUserProfile = RouterOutput['user']['profile'];
export type TUserList = RouterOutput['user']['list'];
export type TUserListItem = RouterOutput['user']['list'][0];
export type TUserRegister = RouterInput['user']['register'];
export type TUserRole = 'student' | 'teacher' | 'admin';

export type TPaper = RouterOutput['paper']['info'];
export type TPaperListSafe = RouterOutput['paper']['list'];
export type TPaperListSafeItem = RouterOutput['paper']['list'][0];
export type TPaperCreate = RouterInput['paper']['create'];
export type TPaperCreateSafe = RouterInput['paper']['createSafe'];
export type TPaperCreateForm = RouterInput['paper']['create'] & { paperFile: string[]; attachments: string[] };
export type TPaperCreateSafeForm = RouterInput['paper']['createSafe'] & { paperFile: string[]; attachments: string[] };
export type TPaperScore = 'A' | 'B' | 'C' | 'D' | null | undefined;
export type TPaperScoringItem = RouterOutput['paper']['scoringList']['list'][0];

export type TClass = RouterOutput['class']['info'];
export type TClassList = RouterOutput['class']['list'];
export type TClassListItem = RouterOutput['class']['list'][0];
export type TClassCreate = RouterInput['class']['create'];
export type TClassState =
  'initialized' |
  'selectGroup' |
  'thesisProposal' |
  'concludingReport' |
  'submitPaper';

export type TAttachment = RouterOutput['paper']['info']['attachments'][0];
export type TAttachmentCreate = RouterInput['attachment']['create'];
export type TAttachmentCategory =
  'paperDocument' |
  'paperAttachment' |
  'reportDocument' |
  'reportPresentation';

export type TReport = RouterOutput['group']['info']['reports'][0];
export type TReportCategory = 'thesisProposal' | 'concludingReport';

export type TNote = RouterOutput['group']['info']['notes'][0];
export type TNoteCreateSafe = RouterInput['note']['createSafe'];

export type TGroup = RouterOutput['group']['info'];
export type TGroupList = RouterOutput['group']['list'];

export interface TSearchOption {
  filter: {
    onlyCanDownload: boolean;
    onlyFeatured: boolean;
    category: number[];
    enterYear: number;
    restrictEnterYear: boolean;
  };
  isAsc: -1 | 1;
  searchSelectValue: string[];
  sortOption: 'time' | 'score' | 'default';
}

export interface TMinimalUser {
  username: string;
  schoolId: string;
  id: string;
}

export type TImportDataResult = RouterOutput['seiue']['importData'];
