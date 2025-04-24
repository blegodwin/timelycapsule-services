import logger from '../config/logger';
export function loggingHandler(req, res, next) {
    logger.info(`method:[${req.method}] - url:[${req.url}] - IP:[${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        const logMessage = `method:[${req.method}] - url:[${req.url}] - IP:[${req.socket.remoteAddress}] - STATUS:[${res.statusCode}]`;
        if (res.statusCode < 400) {
            logger.info(logMessage);
        }
        else {
            logger.error(logMessage);
        }
    });
    next();
}
