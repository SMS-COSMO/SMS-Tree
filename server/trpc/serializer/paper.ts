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

export function paperListItemSerializer(fullInfo: TPaper) {
  const {
    abstract: _abstract,
    comment: _comment,
    groupId: _groupId,
    isPublic: _isPublic,
    leader: _leader,
    authors,
    ...info
  } = fullInfo;
  return {
    authors: authors?.map(x => ({ username: x?.username })),
    ...info,
  };
}
