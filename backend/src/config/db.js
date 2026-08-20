const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected successfully: ${conn.connection.host}`);

        mongoose.connection.once('disconnected', () => {
            console.error('MongoDB disconnected unexpectedly. Shutting down server to prevent data loss.');
            process.exit(1); 
        });

    } catch (error) {
        console.error(`MongoDB Initial Connection Error: ${error.message}`);
        process.exit(1); 
    }
};

module.exports = connectDB;