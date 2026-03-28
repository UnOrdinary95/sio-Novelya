import { Request, Response } from "express";
import { getDb } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../interfaces/TokenPayload.js";
import { UserDB } from "../interfaces/User.js";
import { COLLECTIONS, JWT_SECRET } from "../constants.js";

export const connect = async (email: string, password: string) => {
    const db = getDb();
    const user = await db.collection<UserDB>(COLLECTIONS.USER).findOne({ email });

    if (!user) {
        throw new Error("Identifiants invalides");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Identifiants invalides");
    }

    const payload: TokenPayload = {
        userId: user._id?.toString(),
        email: user.email,
        isAdmin: user.isAdmin
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return { token, userId: user._id?.toString(), email: user.email };
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ success: false, message: "Email et mot de passe sont requis" });
        return;
    }

    try {
        const result = await connect(email, password);

        // Définis le cookie avec le token JWT
        res.cookie("token", result.token, {
            httpOnly: true, // Protège contre les attaques XSS
            secure: process.env.NODE_ENV === "production", // Utilise HTTPS en production (l'expression est un booléen)
            sameSite: "lax", // Protège contre les attaques CSRF
            maxAge: 60 * 60 * 1000 // 1 heure (comme la durée de vie du token)
        });

        // Renvoie tout sauf le token dans la réponse
        res.status(200).json({ success: true, userId: result.userId, email: result.email });
    } catch (error) {
        res.status(401).json({ success: false, message: error instanceof Error ? error.message : "Erreur inconnue lors de la connexion" });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    // Pour que clearCookie fonctionne correctement, les options doivent correspondre à celles utilisées lors de la création du cookie (sauf maxAge)
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })

    res.status(200).json({ success: true, message: "Déconnexion réussie" });
};
