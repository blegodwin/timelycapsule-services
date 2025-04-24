var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../config/logger';
dotenv.config();
export function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const db = (_a = (process.env.NODE_ENV === 'development'
            ? process.env.LOCAL_MONGO_URL
            : process.env.PROD_MONGO_URL)) !== null && _a !== void 0 ? _a : ' ';
        yield mongoose
            .connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
            .then(() => {
            logger.info('<-----x----------------------------------------------------------->');
            logger.info('Successfully connected to a database');
            logger.info('<---------------------------------------------------------------->');
        })
            .catch((error) => {
            logger.info('<---------------------------------------------------------------->');
            logger.fatal('Error connecting to database', 'connection failed ', error);
            logger.info('<---------------------------------------------------------------->');
        });
    });
}
