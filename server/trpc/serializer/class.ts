import type { TRawClass } from '../../db/db';

export type TClass = ReturnType<typeof classSerializer>;

export function classSerializer(
  basicClass: TRawClass,
  students: string[],
  teacher: string | undefined,
  className: string,
) {
  return {
    ...basicClass,
    students,
    teacher,
    className,
  };
}
