import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { URI } from '../constants.js';
import { logger } from '../utils/loggerUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
if (!URI) {
    logger.error('DB Config', new Error('URI MongoDB manquant !'));
    process.exit(1);
}

const client = new MongoClient(URI);
let db: Db | null = null;

export const connectDb = async () => {
    try {
        await client.connect();
        db = client.db();
        logger.info('MongoDB connecté');
    } catch (err) {
        logger.error('DB Connection', err);
        process.exit(1);
    }
};

// Singleton pour obtenir l'instance de la base de données
export const getDb = (): Db => {
    if (!db) throw new Error('Base de données non connectée');
    return db;
};
