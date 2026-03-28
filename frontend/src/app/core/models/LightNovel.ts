export interface LightNovel {
    _id?: string;
    title: string;
    author: string;
    price: number;
    inStock: boolean;
    cover: string;
    description: string;
    genres: string[];
    releaseDate?: Date;
}

export const availableGenres = ["action", "adventure", "comedy", "drama", "fantasy", "horror", "mystery", "romance", "sci-fi", "slice-of-life", "supernatural"];
