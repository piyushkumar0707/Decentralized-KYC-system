import mongoose from 'mongoose';

const encryptionSchema = new mongoose.Schema({
  algo: { type: String, required: true }, // e.g., 'rsa-oaep'
  keywrapped: { type: String, required: true }, // base64-wrapped encryption key
  iv: { type: String },   // for AES-GCM (if used later)
  tag: { type: String },  // for AES-GCM
  keyID: { type: String, required: true }, // reference to KMS or local key
}, { _id: false }); // Disable _id on subdocument

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  did: {
    type: String,
    required: true,
    index: true  //user
  },
  documentType: {
    type: String,
    required: true // e.g., 'passport', 'driver_license'
  },
  documentCID: {
    type: String,
    required: true // IPFS CID
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  encryption: {
    type: encryptionSchema,
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  validUntil: {
    type: Date
  }
}, {
  timestamps: true
});

const KYCRequest = mongoose.model('KYCRequest', kycSchema);
export default KYCRequest;
