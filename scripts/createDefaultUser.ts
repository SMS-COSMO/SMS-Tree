import { nanoid } from 'nanoid';
import { UserController } from '~/server/trpc/controllers/user';

const userController = new UserController();
const password = nanoid(10);
await userController.register({ schoolId: 'admin', username: 'admin', role: 'admin', password });
console.log(`Created default admin user. \nLogin: 'admin' \nPassword: '${password}'`);

const admin = await userController.login('admin', password);
console.log('Admin AccessToken:');
console.log(admin.accessToken);
