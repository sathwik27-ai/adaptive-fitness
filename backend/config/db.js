const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI?.trim() || process.env.MONGODB_URI?.trim());
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        throw new Error(
            `Unable to connect to MongoDB. Check that the local service is running or verify the configured URI, credentials, and network access. Cause: ${err.message}`,
            { cause: err }
        );
    }
};

module.exports = connectDB;