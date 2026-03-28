import { Request, Response } from "express";
import { deleteOneLightNovel, findAllLightNovels, findAllLightNovelsByGenre, findOneLightNovel, insertOneLightNovel, updateOneLightNovel, findLightNovelsByName } from "../models/lightNovelModel.js";
import { getAuthUser } from "../utils/authUserUtils.js";
import { LightNovel } from "../interfaces/LightNovel.js";
import { checkAdminAccess } from "../utils/authUserUtils.js";
import { logger } from "../utils/loggerUtils.js";
import { GENRES } from "../constants.js";
import { buildCoverUrl } from "../utils/lightNovelUtils.js";

// CREATE
export const createLightNovel = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = getAuthUser(req);

        if (!checkAdminAccess(currentUser, res)) return;

        const lightNovel: LightNovel = req.body;
        const newLightNovel = await insertOneLightNovel(lightNovel);
        res.status(201).json(newLightNovel);
    } catch (err) {
        logger.error('createLightNovel', err);
        res.status(500).json({ error: "Impossible de créer le light novel" });
    }
};

// READ
export const getLightNovels = async (req: Request, res: Response): Promise<void> => {
    try {
        const lightNovels = await findAllLightNovels();
        const response = lightNovels.map(ln => ({ ...ln, cover: ln.cover ? buildCoverUrl(ln.cover) : null }));
        res.status(200).json(response);
    } catch (err) {
        logger.error('getLightNovels', err);
        res.status(500).json({ error: "Erreur lors de la récupération des light novels" });
    }
};

export const getLightNovelsByGenre = async (req: Request, res: Response): Promise<void> => {
    const genre = req.params.genre.toLowerCase();
    if (!GENRES.includes(genre)) {
        res.status(400).json({ error: "Genre invalide" });
        return;
    }

    try {
        const lightNovels = await findAllLightNovelsByGenre(genre);
        const response = lightNovels.map(ln => ({ ...ln, cover: ln.cover ? buildCoverUrl(ln.cover) : null }));
        res.status(200).json(response);
    } catch (err) {
        logger.error('getLightNovelsByGenre', err);
        res.status(500).json({ error: "Erreur lors de la récupération des light novels par genre" });
    }
};

export const getLightNovelById = async (req: Request, res: Response): Promise<void> => {
    const lightNovelId = req.params.id;
    try {
        const lightNovel = await findOneLightNovel(lightNovelId);
        const response = { ...lightNovel, cover: lightNovel.cover ? buildCoverUrl(lightNovel.cover) : null };
        res.status(200).json(response);
    } catch (err) {
        logger.error('getLightNovelById', err);
        res.status(500).json({ error: "Erreur lors de la récupération du light novel" });
    }
};

export const searchLightNovelByName = async (req: Request, res: Response): Promise<void> => {
    const name = req.params.name;
    try {
        const lightNovels = await findLightNovelsByName(name);
        const response = lightNovels.map(ln => ({ ...ln, cover: ln.cover ? buildCoverUrl(ln.cover) : null }));
        res.status(200).json(response);
    } catch (err) {
        logger.error('searchLightNovelByName', err);
        res.status(500).json({ error: "Erreur lors de la recherche des light novels" });
    }
};

// UPDATE
export const updateLightNovelById = async (req: Request, res: Response): Promise<void> => {
    const lightNovelId = req.params.id;
    const currentUser = getAuthUser(req);

    if (!checkAdminAccess(currentUser, res)) return;

    const lightNovelData: Partial<LightNovel> = req.body;
    try {
        const updatedLightNovel = await updateOneLightNovel(lightNovelId, lightNovelData);
        res.status(200).json(updatedLightNovel);
    } catch (err) {
        logger.error('updateLightNovelById', err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du light novel" });
    }
};

export const uploadCoverById = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ error: "Aucun fichier téléchargé" });
        return;
    }

    const coverUrl = `covers/${req.params.id}.jpg`; // Dans le path du service de fichiers statiques
    try {
        const updatedLightNovel = await updateOneLightNovel(req.params.id, { cover: coverUrl });
        res.status(200).json(updatedLightNovel);
    } catch (err) {
        logger.error('uploadCoverById', err);
        res.status(500).json({ error: "Erreur lors de l'upload de la couverture" });
    }
};

// DELETE
export const deleteLightNovelById = async (req: Request, res: Response): Promise<void> => {
    const lightNovelId = req.params.id;
    const currentUser = getAuthUser(req);

    if (!checkAdminAccess(currentUser, res)) return;

    try {
        const result = await deleteOneLightNovel(lightNovelId);
        res.status(200).json(result);
    } catch (err) {
        logger.error('deleteLightNovelById', err);
        res.status(500).json({ error: "Erreur lors de la suppression du light novel" });
    }
};
