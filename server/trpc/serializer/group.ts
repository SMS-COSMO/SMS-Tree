import type { TRawGroup } from '../../db/db';

export type TGroup = ReturnType<typeof groupSerializer>;

export function groupSerializer(basicGroup: TRawGroup, members: string[], papers: string[]) {
  return {
    id: basicGroup.id,
    archived: basicGroup.archived,
    leader: basicGroup.leader,
    members,
    papers,
    classId: basicGroup.classId,
    createdAt: basicGroup.createdAt,
  };
}
