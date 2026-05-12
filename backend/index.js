import  dotenv from "dotenv";
import app from './app.js'
import connectDB from './src/config/db.js'
dotenv.config();

connectDB().then(
    ()=>{
        app.on('error',(error)=>{
            console.error("Error in express server: ",error);
            // throw error; // Don't throw in serverless environments
        });

        // Only listen locally. Vercel handles the port binding when exporting the app.
        if (process.env.NODE_ENV !== 'production') {
            const port = process.env.PORT || 3001;
            app.listen(port,()=>{
                console.log(`Server is running on port ${port}`);
            })
        }
    }
).catch((error)=>{
    console.log("Error connecting to MongoDb", error);
    // process.exit(1); // Don't crash the serverless function entirely
})

// Vercel requires the express app to be exported
export default app;