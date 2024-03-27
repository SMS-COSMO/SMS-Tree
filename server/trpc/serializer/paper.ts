import type { TRawPaper } from '../../db/db';

export type TMinimalUser = {
  username: string;
  id: string;
} | undefined;

export type TPaper = ReturnType<typeof paperSerializer>;
export function paperSerializer(content: TRawPaper, authors?: TMinimalUser[], leader?: TMinimalUser) {
  return {
    ...content,
    authors,
    leader,
  };
}
