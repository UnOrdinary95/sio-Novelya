import { CartItem } from "./CartItem";
import { PurchaseHistoryItem } from "./PurchaseHistoryItem";

export interface User {
    _id?: string;
    name: string;
    email: string;
    isAdmin: boolean;
    cart: CartItem[];
    purchaseHistory: PurchaseHistoryItem[];
    wishlist: string[];
}
