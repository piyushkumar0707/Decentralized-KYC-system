//AES-256-GCM TO ENCRYPT FILE BUFFER
import crypto from 'crypto'

import { wrapAESkey,unwrapAESKey,keyID } from '../config/KMS'

import { readFileSync } from 'fs';

const privateKey = readFileSync(process.env.RSA_PRIVATE_KEY_PATH, 'utf8');
const publicKey = readFileSync(process.env.RSA_PUBLIC_KEY_PATH, 'utf8');

export async function generateRSAKeys() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      },
      (err, pubKey, privKey) => {
        if (err) reject(err);
        else resolve({ pubKey, privKey });
      }
    );
  });
}


const encryptionBuffer=async(buffer)=>{

    const aesKey=crypto.randomBytes(32);
    const iv=crypto.randomBytes(12);
    const cipher=crypto.createCipheriv('aes-256-gcm',aesKey,iv);
    const cipherText=Buffer.concat([cipher.update(buffer),cipher.final()]);
    const tag=cipher.getAuthTag();
    const wrappedKey=await wrapAESkey(aesKey);

    return {
        cipherText,
        meta:{
            algo:'AES-256-GCM',
            keyWrapped:wrappedKey.toString('base64'),
            iv,tag,keyID
        }
    }
}


const decryptBuffer=async(cipherText,{keyWrapped,iv,tag})=>{
    const aeskey=await unwrapAESKey(Buffer.from(keyWrapped,'base64'));
    const decipher=crypto.createDecipheriv('aes-256-gcm',aeskey,Buffer.from(iv,'base64'))
    decipher.setAuthTag(Buffer.from(tag,'base64'));
    return Buffer.concat([decipher.update(cipherText),decipher.final()]);


}

const signJson = async (data) => {
    const json = JSON.stringify(data);
    const signature = crypto.sign('sha256', Buffer.from(json), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });
    return { json, signature };
};
const verifySignature = async (data, signature) => {
    const isVerified = crypto.verify(
        'sha256',
        Buffer.from(data),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
    );
    return isVerified;
};
    
export {
    decryptBuffer,
    encryptionBuffer,
    signJson,
    verifySignature
}