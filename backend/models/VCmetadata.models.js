
import mongoose from 'mongoose';

const vcMetadataSchema = new mongoose.Schema(
  {
    issuedTo: {
      type: String, // DID of the subject
      required: true,
    },
    vchash: {
      type: String,
      required: true,
      unique: true,
    },
    ipfs_cid: {
      type: String,
      required: true,
    },
    issuer: {
      type: String, // DID of the issuer
      required: true,
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
  },
  {
    timestamps: true,
  }
);

const VCMetadata = mongoose.model('VCMetadata', vcMetadataSchema);
export default VCMetadata;
