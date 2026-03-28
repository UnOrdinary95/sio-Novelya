import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";
import { User, UserDB } from "../interfaces/User.js";
import { CartItem } from "../interfaces/CartItem.js";
import { PurchaseHistoryItem } from "../interfaces/PurchaseHistoryItem.js";
import { findOneLightNovel, lightNovelExists } from "./lightNovelModel.js";
import { convertObjectIdToUserIdStr, convertUserIdStrToObjectId, validateUserData } from "../utils/userUtils.js";
import { logger } from "../utils/loggerUtils.js";
import { COLLECTIONS } from "../constants.js";
import bcrypt from "bcrypt";

// CREATE
export const insertOneUser = async (user: User): Promise<User> => {
    try {
        const db = getDb();
        const userWithObjectId = convertUserIdStrToObjectId(user);
        const result = await db.collection(COLLECTIONS.USER).insertOne(userWithObjectId);
        return { ...user, _id: result.insertedId.toString() };
    }
    catch (err) {
        logger.error('insertOneUser', err);
        throw new Error("Erreur lors de la création de l'utilisateur");
    }
};

// READ
export const findAllUsers = async (): Promise<User[]> => {
    try {
        const db = getDb();
        const users = await db.collection<UserDB>(COLLECTIONS.USER).find().toArray();
        return users.map(user => {
            const { password, ...userWithoutPassword } = convertObjectIdToUserIdStr(user);
            return userWithoutPassword as User;
        });
    }
    catch (err) {
        logger.error('findAllUsers', err);
        throw new Error("Erreur lors de la récupération des utilisateurs");
    }
};

export const findOneUser = async (userID: string): Promise<User> => {
    try {
        const db = getDb();
        const user = await db.collection<UserDB>(COLLECTIONS.USER).findOne({ _id: new ObjectId(userID) });
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        const { password, ...userWithoutPassword } = convertObjectIdToUserIdStr(user);
        return userWithoutPassword as User;
    }
    catch (err) {
        logger.error('findOneUser', err);
        throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
};

export const emailExists = async (email: string): Promise<boolean> => {
    try {
        const db = getDb();
        const user = await db.collection<UserDB>(COLLECTIONS.USER).findOne({ email });
        return Boolean(user);
    }
    catch (err) {
        logger.error('emailExists', err);
        throw new Error("Erreur lors de la vérification de l'email");
    }
}


// UPDATE
export const updateOneUser = async (userID: string, userData: Partial<User>): Promise<User> => {
    try {
        const db = getDb();

        // Empêche la modification de l'_id
        const { _id, ...safeData } = userData;

        if (Object.keys(safeData).length === 0) {
            throw new Error("Aucune donnée à mettre à jour");
        }

        const currentUser = await findOneUser(userID);
        const validation = await validateUserData(safeData, currentUser.email);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        if (safeData.password) {
            const saltRounds = 10;
            safeData.password = await bcrypt.hash(safeData.password, saltRounds);
        }

        if (safeData.cart) {
            await lightNovelExists(safeData.cart);
        }

        // Nettoie les champs vides avant
        // fromEntries => recrée un objet à partir d'une liste de paires [clé, valeur]
        // entries => renvoie un tableau des paires [clé, valeur] d'un objet
        const cleanData = Object.fromEntries(
            Object.entries(safeData).filter(([_, value]) => value !== '' && value !== undefined)
        );

        const result = await db.collection(COLLECTIONS.USER).updateOne(
            { _id: new ObjectId(userID) },
            { $set: cleanData }
        );
        if (result.matchedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }
        return await findOneUser(userID);
    }
    catch (err) {
        logger.error('updateOneUser', err);
        throw new Error("Erreur lors de la mise à jour de l'utilisateur");
    }
};

export const patchCart = async (userID: string, lightNovelID: string, quantity: number): Promise<CartItem[]> => {
    try {
        if (quantity === 0) {
            throw new Error("La quantité ne peut pas être 0");
        }

        const db = getDb();
        const user = await findOneUser(userID);
        await findOneLightNovel(lightNovelID);

        let updatedCart: CartItem[] = user.cart ? [...user.cart] : [];
        const existingItem = updatedCart.find(item => item.lightNovelId === lightNovelID);
        if (quantity > 0) {
            if (existingItem) {
                existingItem.quantity += quantity;
            }
            else {
                updatedCart.push({ lightNovelId: lightNovelID, quantity });
            }
        }
        else {
            if (!existingItem) {
                throw new Error("L'article n'existe pas dans le panier");
            }

            if (Math.abs(quantity) < existingItem.quantity) {
                existingItem.quantity += quantity;
            }
            else if (Math.abs(quantity) === existingItem.quantity) {
                updatedCart = updatedCart.filter(item => item.lightNovelId !== lightNovelID);
            }
            else {
                throw new Error("La quantité à retirer dépasse la quantité dans le panier");
            }
        }

        const result = await db.collection(COLLECTIONS.USER).updateOne(
            { _id: new ObjectId(userID) },
            { $set: { cart: updatedCart } }
        );

        if (result.matchedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }

        return updatedCart;
    }
    catch (err) {
        logger.error('patchCart', err);
        throw new Error("Erreur lors de la mise à jour du panier de l'utilisateur");
    }
};

export const clearCart = async (userID: string): Promise<void> => {
    try {
        const db = getDb();

        const result = await db.collection(COLLECTIONS.USER).updateOne(
            { _id: new ObjectId(userID) },
            { $set: { cart: [] } }
        );

        if (result.matchedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }
    }
    catch (err) {
        logger.error('clearCart', err);
        throw new Error("Erreur lors de la vidange du panier de l'utilisateur");
    }
};

export const patchPurchaseHistory = async (userID: string): Promise<PurchaseHistoryItem[]> => {
    try {
        const db = getDb();
        const user = await findOneUser(userID);
        const cart = user.cart || [];

        if (!cart || cart.length === 0) {
            throw new Error("Le panier ne doit pas être vide");
        }

        let updatedHistory: PurchaseHistoryItem[] = user.purchaseHistory ? [...user.purchaseHistory] : [];
        updatedHistory.push({ cart, purchaseDate: new Date() });

        const result = await db.collection(COLLECTIONS.USER).updateOne(
            { _id: new ObjectId(userID) },
            { $set: { purchaseHistory: updatedHistory } }
        );

        if (result.matchedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }

        await clearCart(userID);

        return updatedHistory;
    }
    catch (err) {
        logger.error('patchPurchaseHistory', err);
        throw new Error("Erreur lors de la mise à jour de l'historique d'achats de l'utilisateur");
    }
};

export const patchWishlist = async (userID: string, lightNovelID: string): Promise<string[]> => {
    try {
        const db = getDb();
        const user = await findOneUser(userID);
        await findOneLightNovel(lightNovelID);

        let updatedWishlist = user.wishlist ? [...user.wishlist] : [];

        if (user.wishlist?.some(lightNovelId => lightNovelId === lightNovelID)) {
            updatedWishlist = updatedWishlist.filter(lightNovelId => lightNovelId !== lightNovelID);
        } else {
            updatedWishlist.push(lightNovelID);
        }

        const result = await db.collection(COLLECTIONS.USER).updateOne(
            { _id: new ObjectId(userID) },
            { $set: { wishlist: updatedWishlist } }
        );

        if (result.matchedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }

        return updatedWishlist;
    } catch (err) {
        logger.error('patchWishlist', err);
        throw new Error("Erreur lors de la mise à jour de la liste de souhaits de l'utilisateur");
    }
};


// DELETE
export const deleteOneUser = async (userID: string): Promise<void> => {
    try {
        const db = getDb();
        const result = await db.collection(COLLECTIONS.USER).deleteOne({ _id: new ObjectId(userID) });
        if (result.deletedCount === 0) {
            throw new Error("Utilisateur non trouvé");
        }
    }
    catch (err) {
        logger.error('deleteOneUser', err);
        throw new Error("Erreur lors de la suppression de l'utilisateur");
    }
};
