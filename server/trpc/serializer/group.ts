import type { TRawGroup, TRawNote } from '../../db/db';
import type { TMinimalUser, TPaper } from './paper';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(
  basicGroup: TRawGroup,
  papers: TPaper[] | undefined,
  members: TMinimalUser[],
  leader: TMinimalUser,
  notes: TRawNote[] | undefined,
) {
  const { leader: _, ...rest } = basicGroup;
  return {
    ...rest,
    leader,
    members,
    papers,
    notes,
  };
}
