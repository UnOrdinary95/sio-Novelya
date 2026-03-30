import path from 'path';

export const COLLECTIONS = {
    USER: 'User',
    LIGHT_NOVEL: 'LightNovel',
} as const;

export const GENRES = [
    'action',
    'adventure',
    'comedy',
    'drama',
    'fantasy',
    'horror',
    'mystery',
    'romance',
    'sci-fi',
    'slice of life',
    'supernatural',
];

export const PATTERNS = {
    name: /^[a-zA-Z\-_ ]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
} as const;

export const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
    console.log('Running in production mode');
} else {
    console.log('Running in development mode');
}

export const PORT = isProd ? process.env.PORT || 3000 : 3000;
// as string pour indiquer à TypeScript que ce sera toujours un string en production
export const JWT_SECRET = isProd
    ? (process.env.JWT_SECRET as string)
    : '739t8nBsBaWslYtENddDNKMJV/HF/Tk4ZqhPpD5FwCQ=';
export const URI =
    process.env.MONGO_URI ||
    'mongodb://admin:password@localhost:27017/novelya?authSource=admin';
// TODO: utilise localhost en dev !!!

export const NOVELYA_API_URL = isProd
    ? (process.env.NOVELYA_API_URL as string)
    : 'http://localhost:3000';

export const COVERS_DIR = path.join(process.cwd(), 'public', 'covers');
