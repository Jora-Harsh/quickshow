import mongoose from "mongoose";

const connectDB = async () => {
    // Hook listeners before attempting connection
    mongoose.connection.on('connected', () => {
        console.log('MongoDB: Connection established successfully.');
    });
    
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB: Connection error occurred:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB: Connection disconnected.');
    });

    try {
        console.log('MongoDB: Attempting connection to MongoDB Atlas...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is undefined!');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'quickshow'
        });
        console.log('MongoDB: Connection function executed.');
    } catch (error) {
        console.error('MongoDB: Initial connection failed:', error.message);
        throw error; // Propagate up to abort server start if connection fails
    }
}

export default connectDB;