import { CartItem } from "./CartItem.js";

export interface PurchaseHistoryItem {
    cart: CartItem[];
    purchaseDate: Date;
}
