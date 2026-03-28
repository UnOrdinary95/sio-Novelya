import { COVERS_DIR } from "../constants.js";
import multer from "multer"; // Permet de traiter les fichiers uploadés

export const uploadCoverMiddleware = multer({
    storage: multer.diskStorage({
        destination: COVERS_DIR,
        filename: (req, file, cb) => {
            const filename = `${req.params.id}.jpg`;
            cb(null, filename); // Retourne le nom du fichier à multer via le callback
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite la taille du fichier à 5 Mo
    fileFilter: (req, file, cb) => {
        // Autorise uniquement les images jpg, jpeg, png, webp
        if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Seuls les fichiers image (jpg, jpeg, png, webp) sont autorisés."));
        }
    }
}).single("cover"); // On attend un seul fichier avec le champ "cover"
