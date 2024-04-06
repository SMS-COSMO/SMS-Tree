import type { TRawGroup, TRawNote, TRawReport } from '../../db/db';
import type { TMinimalUser, TPaper } from './paper';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(
  basicGroup: TRawGroup,
  members: TMinimalUser[],
  leader: TMinimalUser,
  papers: TPaper[] | undefined,
  notes: TRawNote[] | undefined,
  reports: TRawReport[] | undefined,
) {
  const { leader: _, ...rest } = basicGroup;
  return {
    ...rest,
    leader,
    members,
    papers,
    notes,
    reports,
  };
}
