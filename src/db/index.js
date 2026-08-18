import mongoose from "mongoose";
import dns from "node:dns";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    console.log("this is db call function");

    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        console.error("MONGODB_URI is not set in environment variables.");
        process.exit(1);
    }

    dns.setServers(["10.168.106.228", "1.1.1.1", "8.8.8.8"]);
    console.log("DNS servers used for lookup:", dns.getServers());

    try {
        const connectionInstance = await mongoose.connect(`${mongodbUri}/${DB_NAME}`);
        console.log(`\n MongoDB connected DB host ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("there is some error in mongodb connection ", error);
        process.exit(1);
    }
};
export default connectDB;