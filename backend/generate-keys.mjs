import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const keysDir = path.resolve('./src/keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

fs.writeFileSync(path.join(keysDir, 'rsa_priv.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'rsa_pub.pem'),  publicKey);

console.log('✅ RSA keys generated:');
console.log('   src/keys/rsa_priv.pem');
console.log('   src/keys/rsa_pub.pem');
