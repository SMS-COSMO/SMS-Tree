import { UserController } from '~/server/trpc/controllers/user';

const userController = new UserController();
const password = makeId(10);
await userController.register({ id: 'admin', username: 'admin', role: 'admin', password });
console.log(`Created default admin user. \nUserID: 'admin' \nPassword: '${password}'`);

const admin = (await userController.login('admin', password)).getResOrTRPCError();
console.log('Admin AccessToken:');
console.log(admin.accessToken);
