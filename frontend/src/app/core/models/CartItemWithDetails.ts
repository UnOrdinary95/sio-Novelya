import { CartItem } from './CartItem';
import { LightNovel } from './LightNovel';

export interface CartItemWithDetails {
    cartItem: CartItem;
    lightNovel: LightNovel;
}
