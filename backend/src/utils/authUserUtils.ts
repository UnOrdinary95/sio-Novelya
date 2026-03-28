import { Request, Response } from "express";
import { TokenPayload } from "../interfaces/TokenPayload.js";

// Fonction utilitaire pour récupérer l'utilisateur authentifié depuis la requête
export const getAuthUser = (req: Request): TokenPayload => (req as any).user;

// Fonction utilitaire pour vérifier les droits d'accès d'un utilisateur
export const checkUserAccess = (currentUser: TokenPayload, userId: string, res: Response): boolean => {
    if (currentUser.userId !== userId && !currentUser.isAdmin) {
        res.status(403).json({ error: "Accès refusé : privilèges insuffisants" });
        return false;
    }
    return true;
};

// Fonction utilitaire pour vérifier les droits d'accès administrateur
export const checkAdminAccess = (currentUser: TokenPayload, res: Response): boolean => {
    if (!currentUser.isAdmin) {
        res.status(403).json({ error: "Accès refusé : privilèges administrateur requis" });
        return false;
    }
    return true;
};

// Fonction utilitaire pour vérifier l'accès aux propres données de l'utilisateur
export const checkSelfAccess = (currentUser: TokenPayload, userId: string, res: Response): boolean => {
    if (currentUser.userId !== userId) {
        res.status(403).json({ error: "Accès refusé : vous ne pouvez accéder qu'à vos propres données" });
        return false;
    }
    return true;
};
