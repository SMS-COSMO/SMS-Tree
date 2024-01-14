import type { TRawPaper } from '../../db/db';

export type TPaper = ReturnType<typeof paperSerializer>;
export function paperSerializer(content: TRawPaper, groupId: string) {
  const { S3FileId: _, ...noFileContent } = content;
  return {
    ...noFileContent,
    groupId,
  };
}

export interface TAuthor {
  username: string
  userId: string
};
export type TAuthorPaper = ReturnType<typeof paperWithAuthorSerializer>;
export function paperWithAuthorSerializer(content: TRawPaper, authors: TAuthor[], leader: TAuthor) {
  const { S3FileId: _, ...noFileContent } = content;
  return {
    ...noFileContent,
    authors,
    leader,
  };
}

export function paperFileSerializer(paper: TRawPaper) {
  return {
    S3FileId: paper.S3FileId,
  };
}
