import { ObjectId } from "mongodb";

// Type pour l'API (avec string)
export interface LightNovel {
    _id?: string;
    title: string;
    author: string;
    price: number;
    inStock: boolean;
    cover: string;
    description: string;
    genres: string[];
    releaseDate: Date;
}

// Type interne pour MongoDB (avec ObjectId)
export interface LightNovelDB extends Omit<LightNovel, '_id'> {
    _id?: ObjectId;
}