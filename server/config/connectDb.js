import mongoose from "mongoose";
const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DataBase connected")
        
    } catch (error) {
    console.error("Database Error:", error.message);
}
}
export default connectDb