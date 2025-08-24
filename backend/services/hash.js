import crypto from 'crypto';

export default computeHash=async(objOrBuffer)=>{
    if(Buffer.isBuffer(objOrBuffer)){
        return '0x'+crypto.createHash('sha256').update(objOrBuffer).digest('hex');

    }

    const res=JSON.stringify(objOrBuffer);
    return '0x'+crypto.createHash('sha256').update(res).digest('hex');
}