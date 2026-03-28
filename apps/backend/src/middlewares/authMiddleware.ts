import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../interfaces/TokenPayload.js";
import { JWT_SECRET } from "../constants.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token; // Récupère le token depuis le cookies

    if (!token) {
        res.status(401).json({ message: "Token manquant" });
        return;
    }

    try {
        // as unknown as TokenPayload pour forcer le type TokenPayload
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
        (req as any).user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide ou expiré" });
        return;
    }
};
