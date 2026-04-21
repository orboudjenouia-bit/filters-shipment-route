const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const multer = require('multer');
const checkToken = require('../Middlewares/checkToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');
const { uploadPhoto } = require('../Controllers/uploadController');

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const safeExt = path.extname(file.originalname || '').toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    const isImage =
        file && typeof file.mimetype === 'string'
            ? file.mimetype.startsWith('image/')
            : false;

    if (!isImage) {
        cb(
            new AppError(
                'Only image files are allowed',
                StatusCodes.BAD_REQUEST,
                'VALIDATION_ERROR'
            )
        );
        return;
    }

    cb(null, true);
};

const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

router.post(
    '/photo',
    checkToken,
    uploader.single('photo'),
    asyncHandler(uploadPhoto)
);

module.exports = router;