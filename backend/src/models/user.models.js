import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "DID"
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
        role:this.role
        

      },
      process.env.ACCESS_TOKEN_SECRET,

      {
   
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY

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
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      }
    )
}

export default User = mongoose.model("User", userSchema);
