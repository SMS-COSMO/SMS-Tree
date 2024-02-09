import type { TRawPaper } from '../../db/db';

export type TPaper = ReturnType<typeof paperSerializer>;
export function paperSerializer(content: TRawPaper, groupId?: string) {
  return {
    ...content,
    groupId,
  };
}

export interface TAuthor {
  username: string;
  id: string;
};
export type TAuthorPaper = ReturnType<typeof paperWithAuthorSerializer>;
export function paperWithAuthorSerializer(content: TRawPaper, authors?: TAuthor[], leader?: TAuthor) {
  return {
    ...content,
    authors,
    leader,
  };
}
