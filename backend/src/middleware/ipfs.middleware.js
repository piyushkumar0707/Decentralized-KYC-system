import dotenv from "dotenv";
import pinataSDK from "@pinata/sdk";
import streamifier from "streamifier";
import ApiError from "../utility/ApiError.js";
import axios from "axios";

dotenv.config();

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
  // OR if using JWT:
  // pinataJWTKey: process.env.PINATA_JWT
});

const uploadFileBufferToPinata = async (buffer, name = "file") => {
  try {
    const stream = streamifier.createReadStream(buffer);
    const res = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name },
    });
    return res.IpfsHash;
  } catch (error) {
    throw new ApiError(400, "Something went wrong with the pinata (file)");
  }
};

const uploadJsonToPinata = async (json, name = "json") => {
  try {
    const res = await pinata.pinJSONToIPFS(json, {
      pinataMetadata: { name },
    });
    return res.IpfsHash;
  } catch (error) {
    throw new ApiError(400, "Something went wrong with the pinata (json)");
  }
};

const fetchFromGateway = async (cid) => {
try {
    const url = `${process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs"}/${cid}`;
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(res.data);
} catch (error) {
  throw new ApiError(404,"failed to fetch from IPFS");
}
};

export { fetchFromGateway, uploadFileBufferToPinata, uploadJsonToPinata };
