import type { TRawGroup, TRawNote } from '../../db/db';
import type { TMinimalUser, TPaper } from './paper';
import type { TReport } from './report';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(
  basicGroup: TRawGroup,
  members: TMinimalUser[],
  leader: TMinimalUser,
  papers: TPaper[] | undefined,
  notes: TRawNote[] | undefined,
  reports: TReport[] | undefined,
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
