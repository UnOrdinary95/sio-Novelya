import { Component, output } from '@angular/core';
import { GenreCard } from '../genre-card/genre-card';

@Component({
    selector: 'app-genre-list',
    imports: [GenreCard],
    templateUrl: './genre-list.html',
    styleUrl: './genre-list.css',
})
export class GenreList {
    genres = [
        { name: 'Action', image: 'genres/action.jpg', route: 'action' },
        { name: 'Adventure', image: 'genres/adventure.jpg', route: 'adventure' },
        { name: 'Comedy', image: 'genres/comedy.jpg', route: 'comedy' },
        { name: 'Drama', image: 'genres/drama.jpg', route: 'drama' },
        { name: 'Fantasy', image: 'genres/fantasy.jpg', route: 'fantasy' },
        { name: 'Horror', image: 'genres/horror.jpg', route: 'horror' },
        { name: 'Mystery', image: 'genres/mystery.jpg', route: 'mystery' },
        { name: 'Romance', image: 'genres/romance.jpg', route: 'romance' },
        { name: 'Sci-Fi', image: 'genres/sci-fi.jpg', route: 'sci-fi' },
        { name: 'Slice of Life', image: 'genres/slice-of-life.jpg', route: 'slice-of-life' },
        { name: 'Supernatural', image: 'genres/supernatural.jpg', route: 'supernatural' },
    ]
    genreHovered = output<string>();

    onGenreHover(imageUrl: string) {
        this.genreHovered.emit(imageUrl);
    }
}
