import logger from '../config/logger';
export function routeError(req, res, next) {
    const error = new Error('Route not found');
    logger.error(error);
    return res.status(404).json({ error: error.message });
}
