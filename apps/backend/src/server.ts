import app from "./app.js";
import { connectDb } from "./config/db.js";
import { PORT } from "./constants.js";
import { logger } from "./utils/loggerUtils.js";
import fs from "fs/promises"; // File System pour manipuler les fichiers
import { COVERS_DIR } from "./constants.js";

await fs.mkdir(COVERS_DIR, { recursive: true });

try {
    await connectDb();
    logger.info(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    logger.info(`Accès à la documentation sur http://localhost:${PORT}/docs`);
    app.listen(PORT);
} catch (err) {
    logger.error('DB Connection', err);
    process.exit(1);
}
