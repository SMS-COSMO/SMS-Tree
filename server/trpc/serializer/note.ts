import type { TRawNote } from '../../db/db';
import type { TMinimalUser } from './paper';

export type TNote = ReturnType<typeof noteSerializer>;
export function noteSerializer(content: TRawNote, members: TMinimalUser[], leader: TMinimalUser) {
  return {
    ...content,
    members,
    leader,
  };
}
