import type { TRawClass } from '../../db/db';
import type { TMinimalUser } from './paper';
import type { TUser } from './user';

export type TClass = ReturnType<typeof classSerializer>;

export function classSerializer(
  basicClass: TRawClass,
  students: string[],
  teacher: TUser,
  className: string,
) {
  return {
    ...basicClass,
    students,
    teacher: {
      id: teacher.id,
      username: teacher.username,
    } as TMinimalUser,
    className,
  };
}
