const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')

const authToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return next(new AppError("No authorization header sent", StatusCodes.UNAUTHORIZED, "NO_HEADER"));
        }
        const [scheme, token] = authHeader.split(' ')
        if (scheme !== 'Bearer') {
            return next(new AppError("Invalid authorization scheme", StatusCodes.UNAUTHORIZED, "INVALID_AUTH_SCHEME"));
        }
        if (!token) {
            return next(new AppError("No token provided", StatusCodes.UNAUTHORIZED, "NO_TOKEN"));
        }
        
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = verified
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new AppError("Token has expired", StatusCodes.UNAUTHORIZED, "TOKEN_EXPIRED"));
        }
        if (error.name === "JsonWebTokenError") {
            return next(new AppError("Invalid or malformed token", StatusCodes.UNAUTHORIZED, "INVALID_TOKEN"));
        }
        next(error);
    }
}

module.exports = authToken