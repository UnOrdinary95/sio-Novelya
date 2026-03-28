import { Component, inject, input, output } from '@angular/core';
import { HlmCard } from '@spartan-ng/helm/card';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-genre-card',
    imports: [HlmCard, NgOptimizedImage],
    templateUrl: './genre-card.html',
    styleUrl: './genre-card.css',
})
export class GenreCard {
    private router = inject(Router);
    image = input.required<string>();
    genreName = input.required<string>();
    genreRoute = input.required<string>();
    hovered = output<string>();

    onMouseOver() {
        this.hovered.emit(this.image());
    }

    onClick() {
        this.router.navigate(['/genre', this.genreRoute()]);
    }
}
