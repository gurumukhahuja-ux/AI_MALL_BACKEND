const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGODB_ATLAS_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET
    }
};
