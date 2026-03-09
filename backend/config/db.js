const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI =
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        'mongodb://127.0.0.1:27017/webathon-main';

    try {
        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('MongoDB connection error:', err.message || err);
        process.exit(1);
    }
};

module.exports = connectDB;