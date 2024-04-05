import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose';

// generate keys for encryption and signing
const { publicKey: encPublic, privateKey: encPrivate } = await generateKeyPair('RSA-OAEP-256');
const { publicKey: signPublic, privateKey: signPrivate } = await generateKeyPair('RS512');

// generate a unique key Id
const encKeyId = `enc-${new Date().toISOString()}`;
const signKeyId = `sign-${new Date().toISOString()}`;

console.log(`encPrivate：\n`, await exportPKCS8(encPrivate));
console.log(`encPublic：\n`, await exportSPKI(encPublic));
console.log('encKeyId:', encKeyId);

console.log('\n-------------------\n');

console.log(`signPrivate：\n`, await exportPKCS8(signPrivate));
console.log(`signPublic：\n`, await exportSPKI(signPublic));
console.log('signKeyId:', signKeyId);
