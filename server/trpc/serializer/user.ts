import type { TRawUser } from '../../db/db';

export type TUser = ReturnType<typeof userSerializer>;

export function userSerializer(basicUser: TRawUser, groupIds: string[], classIds: string[]) {
  return {
    id: basicUser.id,
    username: basicUser.username,
    role: basicUser.role,
    createdAt: basicUser.createdAt,
    groupIds,
    classIds,
  };
}
