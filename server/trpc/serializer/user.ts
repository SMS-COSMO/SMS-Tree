import type { TRawUser } from '../../db/db';

export type TUser = ReturnType<typeof userSerializer>;

export function userSerializer(basicUser: TRawUser, groupIds: string[], classIds: string[]) {
  const { password: _, ...noPasswordBasicUser } = basicUser;
  return {
    ...noPasswordBasicUser,
    groupIds,
    classIds,
  };
}
