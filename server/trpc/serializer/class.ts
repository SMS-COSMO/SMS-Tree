import type { TRawClass } from '../../db/db';

export type TClass = ReturnType<typeof classSerializer>;

export function classSerializer(basicClass: TRawClass, users: string[]) {
  return {
    ...basicClass,
    users,
  };
}
