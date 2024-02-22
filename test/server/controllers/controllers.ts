import { UserController } from '../../../server/trpc/controllers/user';
import { PaperController } from '../../../server/trpc/controllers/paper';
import { GroupController } from '../../../server/trpc/controllers/group';
import { ClassController } from '../../../server/trpc/controllers/class';
import { AttachmentController } from '../../../server/trpc/controllers/attachment';

const uc = new UserController();
const pc = new PaperController();
const gc = new GroupController();
const cc = new ClassController();
const ac = new AttachmentController();

export const ctl = {
  uc,
  pc,
  gc,
  cc,
  ac,
};
