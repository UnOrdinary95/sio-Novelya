import { Request, Response } from "express";
import { deleteOneUser, findAllUsers, findOneUser, patchCart, patchPurchaseHistory, patchWishlist, updateOneUser } from "../models/userModel.js";
import { User } from "../interfaces/User.js";
import { getAuthUser, checkUserAccess, checkAdminAccess, checkSelfAccess } from "../utils/authUserUtils.js";
import { logger } from "../utils/loggerUtils.js";

// READ
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    if (!currentUser) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
    }

    try {
        const user = await findOneUser(currentUser.userId);
        res.status(200).json(user);
    }
    catch (err) {
        logger.error('getCurrentUser', err);
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);  // Récupère l'utilisateur authentifié

    if (!checkAdminAccess(currentUser, res)) return;

    try {
        const users = await findAllUsers();
        res.status(200).json(users);
    }
    catch (err) {
        logger.error('getUsers', err);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkUserAccess(currentUser, userId, res)) return;

    try {
        const user = await findOneUser(userId);
        res.status(200).json(user);
    }
    catch (err) {
        logger.error('getUserById', err);
        res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};

// UPDATE
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkUserAccess(currentUser, userId, res)) return;

    const userData: Partial<User> = req.body;
    try {
        const updatedUser = await updateOneUser(userId, userData);
        res.status(200).json(updatedUser);
    }
    catch (err) {
        logger.error('updateUserById', err);
        if ((err as Error).message === "Email déjà utilisé") {
            res.status(409).json({ error: (err as Error).message });
            return;
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
    }
};

export const updateUserCartById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkSelfAccess(currentUser, userId, res)) return;

    const lightNovelId: string = req.body.lightNovelId;
    const quantity: number = req.body.quantity;
    try {
        const updatedUser = await patchCart(userId, lightNovelId, quantity);
        res.status(200).json(updatedUser);
    }
    catch (err) {
        logger.error('updateUserCartById', err);
        res.status(500).json({ error: "Erreur lors de la mise à jour du panier de l'utilisateur" });
    }
};

export const updateUserPurchaseHistoryById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkSelfAccess(currentUser, userId, res)) return;

    try {
        const updatedHistory = await patchPurchaseHistory(userId);
        res.status(200).json(updatedHistory);
    }
    catch (err) {
        logger.error('updateUserPurchaseHistoryById', err);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'historique d'achats de l'utilisateur" });
    }
};

export const updatedWishlistById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkSelfAccess(currentUser, userId, res)) return;

    const lightNovelId = req.body.lightNovelId;
    try {
        const updatedWishlist = await patchWishlist(userId, lightNovelId);
        res.status(200).json(updatedWishlist);
    }
    catch (err) {
        logger.error('updatedWishlistById', err);
        res.status(500).json({ error: "Erreur lors de la mise à jour de la wishlist de l'utilisateur" });
    }
};

// DELETE
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    const currentUser = getAuthUser(req);
    const userId = req.params.id;

    if (!checkUserAccess(currentUser, userId, res)) return;

    try {
        const result = await deleteOneUser(userId);
        res.status(200).json(result);
    }
    catch (err) {
        logger.error('deleteUserById', err);
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
};
