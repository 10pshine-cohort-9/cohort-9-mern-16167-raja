const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected successfully: ${conn.connection.host}`);

        mongoose.connection.once('disconnected', () => {
            console.error('MongoDB disconnected. Attempting to reconnect...');
            
            setTimeout(() => {
                if (mongoose.connection.readyState === 0) {
                    console.error('MongoDB failed to reconnect. Shutting down.');
                    process.exit(1);
                }
            }, 5000);
        });

    } catch (error) {
        console.error(`MongoDB Initial Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;