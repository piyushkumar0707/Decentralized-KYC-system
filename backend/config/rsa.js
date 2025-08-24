import fs from 'fs/promises'

export async function loadKeys() {
    const privateKey = await fs.readFile(process.env.RSA_PRIVATE_KEY_PATH, 'utf8');
    const publicKey = await fs.readFile(process.env.RSA_PUBLIC_KEY_PATH, 'utf8');
    return { privateKey, publicKey };
}