class CustomError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.timeStamp = new Date().toISOString();
    }
}

module.exports = CustomError;
