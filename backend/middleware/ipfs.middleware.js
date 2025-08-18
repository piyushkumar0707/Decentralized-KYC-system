const { PinataSDK } = require("pinata")
import streamifier from "streamifier";
import ApiError from "../utility/ApiError";
require("dotenv").config()
import axios from 'axios'

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY
})

const uploadFileBufferToPinata=async(buffer,name='file')=>{
try {
    const stream=streamifier.createReadStream(buffer);
    const res=await pinata.pinFileToIPFS(stream,{pinataMetadata:{name}});
    return res.IpfsHash;
} catch (error) {
    throw new ApiError(400,"Something went wrong with the pinata")
}
};


const uploadJsonToPinata=async(json,name='json')=>{
try {
    const res=await pinata.pinJsonToIPFS(json,{pinataMetadata:{name}});
    return res.IpfsHash;
} catch (error) {
    throw new ApiError(400,"Something went wrong with the pinata(json)")
}
};

const fetchFromGateway=async(cid)=>{
    const url=`${process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs'}/${cid}`
    const res=await axios.get(url,{responseType:"arraybuffer"});
    return Buffer.from(res.data);
}
export {fetchFromGateway,uploadFileBufferToPinata,uploadJsonToPinata};