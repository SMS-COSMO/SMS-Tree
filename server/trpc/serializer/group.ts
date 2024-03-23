import type { TRawGroup } from '../../db/db';
import type { TMinimalUser, TPaper } from './paper';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(
  basicGroup: TRawGroup,
  papers: TPaper[],
  members: TMinimalUser[],
  leader: TMinimalUser,
) {
  const { leader: _, ...rest } = basicGroup;
  return {
    ...rest,
    leader,
    members,
    papers,
  };
}
