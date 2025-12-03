import mongoose from 'mongoose';

const DB_NAME = "project_management_system"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n ✅MongoDB connected  !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("❌MongoDB connection error:", error);
        process.exit(1);
    }
}


export default connectDB;