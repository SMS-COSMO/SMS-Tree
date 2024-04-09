import { expect, it, vi } from 'vitest';
import { db } from '../mockDb';
import * as exports from '../../../server/db/db';

it('hasPerm', async () => {
  vi.spyOn(exports, 'db', 'get').mockReturnValue(db);

  // TODO test
});
