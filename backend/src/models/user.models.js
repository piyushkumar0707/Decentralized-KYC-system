import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse:true
    },
    password: {
      type: String,
      
      
    },
    role: {
      type: String,
      enum: ["user", "issuer", "verifier", "admin"],
      default:"user"
    },
    refreshToken: {
      type: String,
    },
     did: {
            type: String, // Corrected from ObjectId to String
            default: null,
            unique: true,
            sparse: true, // Allows multiple null values
        },
    wallet:{
      type:String,
      unique:true,
      lowercase:true,
      sparse:true,
      index:true
    },
    nonce:{
      type:String,
    }
    // ,
    // didDocumentCID: String, //IPFS CID OF DID DOCUMENT
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

userSchema.methods.isPasswordCorrect=async function(password){
 return await bcrypt.compare(password,this.password );
}

//GENERATE ACCESS TOKEN
userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
      {
        _id:this._id,
        email:this.email,
        username:this.username,
        role:this.role,
        address:this.wallet
        

      },
      process.env.ACCESS_TOKEN_SECRET,

      {
   
        expiresIn:process.env.ACCESS_TOKEN_EXPIRATION

      }
    )
}

//GENERATE REFRESH TOKEN
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
      {
        _id:this._id,
      
      },
      process.env.REFRESH_TOKEN_SECRET,

      {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRATION
      }
    )
}

const User = mongoose.model("User", userSchema);
export default User;