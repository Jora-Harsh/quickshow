import mongoose from "mongoose";

const connectDB = async () => {
    try {

        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        
        // Safe database connection using dbName option to override or specify database
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'quickshow'
        });

    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;