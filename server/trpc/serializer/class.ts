import type { TRawClass } from '../../db/db';

export type TClass = ReturnType<typeof classSerializer>;

export function classSerializer(basicClass: TRawClass, students: string[], teacher: string) {
  return {
    ...basicClass,
    students,
    teacher,
  };
}
