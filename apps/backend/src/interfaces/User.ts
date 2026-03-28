import { CartItem } from "./CartItem.js";
import { PurchaseHistoryItem } from "./PurchaseHistoryItem.js";
import { ObjectId } from "mongodb";

// Type pour l'API (avec string)
export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    cart: CartItem[];
    purchaseHistory: PurchaseHistoryItem[];
    wishlist: string[]; // Liste des lightNovelId en tant que strings
}

// Type interne pour MongoDB (avec ObjectId)
export interface UserDB extends Omit<User, '_id'> {
    _id?: ObjectId;
}
