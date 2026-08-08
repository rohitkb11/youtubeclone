import mongoose from "mongoose";
import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import { app } from "./app.js";


dotenv.config()

connectDB()



app.listen(process.env.PORT, () => {
    console.log(`this is working at port http://localhost:${process.env.PORT}`);
})

// import express from 'express'
// import { DB_NAME } from "./constants";
// const app = express()

// ;(async ()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log("ERROR:",error);
//             throw error;
            
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening at port ${process.env.PORT}` );
//                     })
//     } catch (err) {
//         console.error("ERROR:",err);
//          throw err;
        
        
//     }
// })()