const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Multer — memory storage, image-only, 5 MB max
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param {Buffer} buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} Secure URL
 */
const uploadToCloudinary = (buffer, folder = 'workouts') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image', format: 'webp', quality: 'auto' },
            (err, result) => {
                if (err) return reject(err);
                resolve(result.secure_url);
            }
        );
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
};

module.exports = { upload, uploadToCloudinary };
