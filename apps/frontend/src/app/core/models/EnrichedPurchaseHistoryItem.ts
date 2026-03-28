import { PurchaseHistoryItem } from './PurchaseHistoryItem';

export interface EnrichedPurchaseHistoryItem {
    original: PurchaseHistoryItem;
    firstItemCover: string;
}
