import type { TRawUser } from '../../db/db';

export type TUser = ReturnType<typeof userSerializer>;
export type TUserSafe = ReturnType<typeof userSerializerSafe>;

export function userSerializer(
  basicUser: TRawUser,
  groupIds: string[],
  classIds: string[],
  projectName?: string | null,
  className?: string,
) {
  const { password: _, ...noPasswordBasicUser } = basicUser;
  return {
    ...noPasswordBasicUser,
    groupIds,
    classIds,
    projectName,
    className,
  };
}

export function userSerializerSafe(user: TUser) {
  const { schoolID: _, ...safeUser } = user;
  return safeUser;
}
