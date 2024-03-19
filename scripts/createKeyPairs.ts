import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose';

// generate keys for encryption and signing
const { publicKey: encPublic, privateKey: encPrivate } = await generateKeyPair('RSA-OAEP-256');
const { publicKey: signPublic, privateKey: signPrivate } = await generateKeyPair('RS512');

// generate a unique key ID
const encKeyID = `enc-${new Date().toISOString()}`;
const signKeyID = `sign-${new Date().toISOString()}`;

console.log(`encPrivate：\n`, await exportPKCS8(encPrivate));
console.log(`encPublic：\n`, await exportSPKI(encPublic));
console.log('encKeyID:', encKeyID);

console.log('\n-------------------\n');

console.log(`signPrivate：\n`, await exportPKCS8(signPrivate));
console.log(`signPublic：\n`, await exportSPKI(signPublic));
console.log('signKeyID:', signKeyID);
