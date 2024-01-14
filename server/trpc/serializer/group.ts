import type { TRawGroup } from '../../db/db';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(basicGroup: TRawGroup, members: string[], papers: string[]) {
  return {
    ...basicGroup,
    members,
    papers,
  };
}
