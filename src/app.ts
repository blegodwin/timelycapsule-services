import express from 'express';
import logger from './config/logger';
import { loggingHandler } from './middleware/pinoHttp';
import { routeError } from './middleware/routeError';
import { connectDB } from './config/db';
import capsuleRouter from './routes/index';
import authRouter from './routes/auth.routes';
import dotenv from 'dotenv';
import cors from 'cors';
import activityLogRoutes from './routes/activityLog.routes';

dotenv.config();

const app = express();

app.use(
	cors({
		origin: '*',
		allowedHeaders: '*',
		exposedHeaders: '*',
	})
);

app.use(loggingHandler);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/capsule', capsuleRouter());
app.use('/api/v1/auth', authRouter());
app.use('/api/v1/activity/log', activityLogRoutes);

app.use(routeError);

app.listen(process.env.PORT, () => {
	logger.info(
		`<---------------------------------------------------------------->`
	);
	logger.info(`Server is running on port ${process.env.PORT}`);
	connectDB();
	logger.info(
		`<---------------------------------------------------------------->`
	);
});
