const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const env = require('../config/env');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUD_NAME,
    api_key: env.CLOUDINARY.API_KEY,
    api_secret: env.CLOUDINARY.API_SECRET
});

logger.info(`[Cloudinary] Initialized with Cloud Name: ${env.CLOUDINARY.CLOUD_NAME}`);

// Configure Multer Storage (Direct stream to Cloudinary)
// Configure Multer Storage (Memory Storage)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

const uploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'aibase_uploads',
                resource_type: 'auto',
                ...options
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
};

const uploadFileToCloudinary = (filePath, options = {}) => {
    return cloudinary.uploader.upload(filePath, {
        folder: 'aibase_uploads',
        resource_type: 'auto',
        ...options
    });
};

module.exports = { cloudinary, upload, uploadToCloudinary, uploadFileToCloudinary };
