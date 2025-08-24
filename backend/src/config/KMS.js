import fs from 'fs'
import crypto from 'crypto'

const PRIV=fs.readFileSync('../keys/rsa_priv.pem','utf-8')
const PUB=fs.readFileSync('../keys/rsa_pub.pem','utf-8')
const keyID='rsa-dev-v1'

// Wrap a symmetric AES key with RSA-OAEP-SHA256
const wrapAESkey=async(aeskeyBuf)=>{
return crypto.publicEncrypt({key:PUB,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},aeskeyBuf)
}

// Unwrap
const unwrapAESKey=async(wrappedBuf)=>{
    return crypto.privateDecrypt({
        key:PRIV,
        padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash:'sha256'
    },wrappedBuf);

}

export {
wrapAESkey,
unwrapAESKey,
keyID
}