
import mongoose from 'mongoose';
import User from './user.models.js';

const vcMetadataSchema = new mongoose.Schema(
  {
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId, // DID of the subject
      required: true,
      ref: 'User'
    },
    vchash: {
      type: String,
      required: true,
      unique: true,
    },
    kyc:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KYCrequests'
    },
    ipfs_cid: {
      type: String,
      required: true,
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId, // DID of the issuer
      required: true,
      ref: 'User'
    },
    anchored: {
      type: Boolean,
      default: false,
    },
    txhash: {
      type: String, // Blockchain transaction hash
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    signature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const VCMetadata = mongoose.model('VCMetadata', vcMetadataSchema);
export default VCMetadata;
