import type { TRawGroup, TRawPaper } from '../../db/db';
import type { TUser } from './user';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(basicGroup: TRawGroup, members: TUser[], papers: TRawPaper[]) {
  const { leader: leaderId, ...rest } = basicGroup;
  const leader = members.find(member => member.id === leaderId);
  return {
    ...rest,
    leader,
    members,
    papers,
  };
}
