import  dotenv from "dotenv";
import app from './app.js'
import connectDB from './config/db.js'
dotenv.config();

connectDB().then(
    ()=>{
        app.on('error',(error)=>{
            console.error("Error in express server: ",error);
            throw error;
        });

        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);

        })
    }
).catch((error)=>{
    console.log("Error connecting to MongoDb");
    process.exit(1);
})