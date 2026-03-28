import { genreRouteToAPI } from "@core/models/Genre";

export function getGenreApiValue(route: string): string {
    return genreRouteToAPI[route] ?? route;
}
