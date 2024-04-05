import type { TRawUser } from '../../db/db';

export type TUser = ReturnType<typeof userSerializer>;
export type TUserSafe = ReturnType<typeof userSerializerSafe>;

export function userSerializer(
  basicUser: TRawUser,
  groupIds: string[],
  classId: string | undefined,
  projectName?: string | null,
  className?: string,
) {
  const { password: _, ...noPasswordBasicUser } = basicUser;
  return {
    ...noPasswordBasicUser,
    groupIds,
    classId,
    projectName,
    className,
  };
}

export function userSerializerSafe(user: TUser) {
  const { schoolId: _, ...safeUser } = user;
  return safeUser;
}
