import e, { Request, Response } from "express";
import { getDb } from "../config/db.js";
import bcrypt from "bcrypt";
import { User } from "../interfaces/User.js";
import { logger } from "../utils/loggerUtils.js";
import { COLLECTIONS } from "../constants.js";
import { validateInput } from "../utils/userUtils.js";

const createUser = async (user: Pick<User, "name" | "email" | "password">): Promise<{ success: boolean; message: string; userId?: string }> => {
    try {
        const db = getDb();

        const existingUser = await db.collection(COLLECTIONS.USER).findOne({ email: user.email });

        if (existingUser) {
            throw new Error("Email déjà utilisé");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // MongoDB générera automatiquement l'_id
        const newUser = {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            isAdmin: false,
            cart: [],
            purchaseHistory: [],
            wishlist: [],
        };

        const result = await db.collection(COLLECTIONS.USER).insertOne(newUser);

        if (!result.insertedId) {
            throw new Error("Erreur lors de la création de l'utilisateur");
        }

        return {
            success: true,
            message: "Utilisateur créé avec succès",
            userId: result.insertedId.toString(),
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Erreur inconnue lors de la création de l'utilisateur",
        };
    }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const user: User = req.body;

    if (!user.email || !user.password || !user.name) {
        res.status(400).json({ success: false, message: "Tous les champs sont requis" });
        return;
    }

    const validation = await validateInput(user.name, user.email, user.password);
    if (!validation.valid) {
        const statusCode = validation.error === "Email déjà utilisé" ? 409 : 400;
        res.status(statusCode).json({ success: false, message: validation.error });
        return;
    }

    try {
        const result = await createUser(user);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        logger.error('registerUser', error);
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};
