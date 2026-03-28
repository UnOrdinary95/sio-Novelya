import { ObjectId } from "mongodb";
import { User, UserDB } from "../interfaces/User.js";
import { PATTERNS } from "../constants.js";
import { emailExists } from "../models/userModel.js";

// Fonction utilitaire pour convertir les champs d'ID string en ObjectId
export const convertUserIdStrToObjectId = (user: User): UserDB => {
    return {
        ...user,
        _id: user._id ? new ObjectId(user._id) : undefined
    }
};

// Fonction utilitaire pour convertir les champs d'ID ObjectId en string
export const convertObjectIdToUserIdStr = (user: UserDB): User => {
    return {
        ...user,
        _id: user._id?.toString()
    }
};

export const validateInput = async (name: string, email: string, password: string): Promise<{ valid: boolean; error?: string; }> => {
    if (!PATTERNS.name.test(name)) {
        return { valid: false, error: "Le nom doit contenir uniquement des lettres, tirets et underscores" };
    }
    if (!PATTERNS.email.test(email)) {
        return { valid: false, error: "Email invalide" };
    }
    if (!PATTERNS.password.test(password)) {
        return { valid: false, error: "Le mot de passe doit contenir au minimum 8 caractères avec au moins une majuscule et une minuscule" };
    }
    if (await emailExists(email)) {
        return { valid: false, error: "Email déjà utilisé" };
    }
    return { valid: true };
};

export const validateUserData = async (userData: Partial<User>, currentEmail?: string): Promise<{ valid: boolean; error?: string }> => {
    if (userData.name && !PATTERNS.name.test(userData.name)) {
        return { valid: false, error: "Le nom doit contenir uniquement des lettres, tirets et underscores" };
    }
    if (userData.email && !PATTERNS.email.test(userData.email)) {
        return { valid: false, error: "Email invalide" };
    }
    if (userData.email && userData.email !== currentEmail && await emailExists(userData.email)) {
        return { valid: false, error: "Email déjà utilisé" };
    }
    if (userData.password && !PATTERNS.password.test(userData.password)) {
        return { valid: false, error: "Le mot de passe doit contenir au minimum 8 caractères avec au moins une majuscule et une minuscule" };
    }
    return { valid: true };
};
