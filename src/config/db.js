// Database connection configuration
const mongoose = require('mongoose');
const dbUrl = process.env.MONGODB_URI;

async function connectDB(){
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;
