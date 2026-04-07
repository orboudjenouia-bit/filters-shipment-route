const path = require('path');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');

const uploadPhoto = async (req, res, next) => {
    const file = req.file;

    if (!file) {
        throw new AppError(
            'Photo file is required',
            StatusCodes.BAD_REQUEST,
            'VALIDATION_ERROR'
        );
    }

    const normalizedPath = file.path.split(path.sep).join('/');
    const uploadsIndex = normalizedPath.lastIndexOf('/uploads/');

    const relativePath =
        uploadsIndex >= 0
            ? normalizedPath.slice(uploadsIndex + 1)
            : `uploads/${file.filename}`;

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Photo uploaded successfully',
        data: {
            path: `/${relativePath}`,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
        },
    });
};

module.exports = { uploadPhoto };