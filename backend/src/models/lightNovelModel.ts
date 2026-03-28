import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";
import { LightNovel, LightNovelDB } from "../interfaces/LightNovel.js";
import { CartItem } from "../interfaces/CartItem.js";
import { convertObjectIdToLightNovelIdStr, convertLightNovelIdStrToObjectId } from "../utils/lightNovelUtils.js";
import { logger } from "../utils/loggerUtils.js";
import { COLLECTIONS } from "../constants.js";

// CREATE
export const insertOneLightNovel = async (lightNovel: LightNovel): Promise<LightNovel> => {
    try {
        const db = getDb();
        const lightNovelWithObjectId = convertLightNovelIdStrToObjectId(lightNovel);
        const result = await db.collection<LightNovelDB>(COLLECTIONS.LIGHT_NOVEL).insertOne(lightNovelWithObjectId);
        return { ...lightNovel, _id: result.insertedId.toString() };
    } catch (err) {
        logger.error('insertOneLightNovel', err);
        throw new Error("Erreur lors de la création du light novel");
    }
};

// READ
export const findAllLightNovels = async (): Promise<LightNovel[]> => {
    try {
        const db = getDb();
        const lightNovels = await db.collection<LightNovelDB>(COLLECTIONS.LIGHT_NOVEL).find().sort({ title: 1 }).toArray();
        return lightNovels.map(lightNovel => convertObjectIdToLightNovelIdStr(lightNovel));
    } catch (err) {
        logger.error('findAllLightNovels', err);
        throw new Error("Erreur lors de la récupération des light novels");
    }
};

export const findAllLightNovelsByGenre = async (genre: string): Promise<LightNovel[]> => {
    try {
        const db = getDb();
        const lightNovels = await db.collection<LightNovelDB>(COLLECTIONS.LIGHT_NOVEL).find({ genres: genre }).sort({ title: 1 }).toArray();
        return lightNovels.map(lightNovel => convertObjectIdToLightNovelIdStr(lightNovel));
    } catch (err) {
        logger.error('findAllLightNovelsByGenre', err);
        throw new Error("Erreur lors de la récupération des light novels par genre");
    }
};

export const findOneLightNovel = async (lightNovelID: string): Promise<LightNovel> => {
    try {
        const db = getDb();
        const lightNovel = await db.collection<LightNovelDB>(COLLECTIONS.LIGHT_NOVEL).findOne({ _id: new ObjectId(lightNovelID) });
        if (!lightNovel) {
            throw new Error("Light novel non trouvé");
        }
        return convertObjectIdToLightNovelIdStr(lightNovel);
    } catch (err) {
        logger.error('findOneLightNovel', err);
        throw new Error("Erreur lors de la récupération du light novel");
    }
};

export const findLightNovelsByName = async (name: string): Promise<LightNovel[]> => {
    try {
        const db = getDb();
        // "i" = insensible à la casse (case-insensitive)
        const lightNovels = await db.collection<LightNovelDB>(COLLECTIONS.LIGHT_NOVEL).find({ title: { $regex: name, $options: "i" } }).sort({ title: 1 }).toArray();
        return lightNovels.map(lightNovel => convertObjectIdToLightNovelIdStr(lightNovel));
    } catch (err) {
        logger.error('findLightNovelsByName', err);
        throw new Error("Erreur lors de la recherche des light novels");
    }
};

// UPDATE
export const updateOneLightNovel = async (lightNovelID: string, lightNovelData: Partial<LightNovel>): Promise<LightNovel> => {
    try {
        const db = getDb();
        const { _id, ...safeData } = lightNovelData;

        if (Object.keys(safeData).length === 0) {
            throw new Error("Aucune donnée à mettre à jour");
        }

        const result = await db.collection(COLLECTIONS.LIGHT_NOVEL).updateOne(
            { _id: new ObjectId(lightNovelID) },
            { $set: safeData }
        );

        if (result.matchedCount === 0) {
            throw new Error("Light novel non trouvé");
        }

        return await findOneLightNovel(lightNovelID);
    } catch (err) {
        logger.error('updateOneLightNovel', err);
        throw new Error("Erreur lors de la mise à jour du light novel");
    }
};

// DELETE
export const deleteOneLightNovel = async (lightNovelID: string): Promise<void> => {
    try {
        const db = getDb();
        const result = await db.collection(COLLECTIONS.LIGHT_NOVEL).deleteOne({ _id: new ObjectId(lightNovelID) });
        if (result.deletedCount === 0) {
            throw new Error("Light novel non trouvé");
        }
    } catch (err) {
        logger.error('deleteOneLightNovel', err);
        throw new Error("Erreur lors de la suppression du light novel");
    }
};

// UTILS
export async function lightNovelExists(cart: CartItem[]): Promise<void> {
    for (const item of cart) {
        await findOneLightNovel(item.lightNovelId);
    }
};
