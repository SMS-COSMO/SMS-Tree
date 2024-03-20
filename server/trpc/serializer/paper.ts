import type { TRawPaper } from '../../db/db';

export interface TAuthor {
  username: string;
  id: string;
};

export type TPaper = ReturnType<typeof paperSerializer>;
export function paperSerializer(content: TRawPaper, authors?: TAuthor[], leader?: TAuthor) {
  return {
    ...content,
    authors,
    leader,
  };
}
