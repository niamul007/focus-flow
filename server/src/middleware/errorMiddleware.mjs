export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    
    // Determine if it's a 4xx (fail) or 5xx (error)
    err.status = err.status || "error"

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
    
};

export default globalErrorHandler;