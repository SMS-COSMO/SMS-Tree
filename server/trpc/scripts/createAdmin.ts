/* eslint-disable no-console */

import { nanoid } from 'nanoid';
import { UserController } from '../controllers/user';

const userController = new UserController();
const password = nanoid(10);
await userController.register({ username: 'admin', id: 'admin', password, role: 'admin' });
console.log(`Created default admin user. \nUserID: 'admin' \nUsername: 'admin' \nPassword: '${password}'`);
const admin = await userController.login('admin', password);
console.log('Admin AccessToken:');
console.log(admin?.accessToken);
