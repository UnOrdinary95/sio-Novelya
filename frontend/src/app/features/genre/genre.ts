import { LightNovelService } from '@core/services/lightnovel/lightnovel.service';
import { Component, inject, input, effect, computed } from '@angular/core';
import { Router } from '@angular/router';
import { availableGenres, LightNovel } from '@core/models/LightNovel';
import { catchError, of, switchMap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { environment } from '@environments/environment';
import { LightnovelList } from '@/app/shared/components/lightnovel-list/lightnovel-list';
import { genreRouteToName } from '@core/models/Genre';
import { getGenreApiValue } from '@/app/shared/helpers/getGenreAPIValue';

@Component({
    selector: 'app-genre',
    imports: [LightnovelList],
    templateUrl: './genre.html',
    styleUrl: './genre.css',
})
export class Genre {
    private router = inject(Router);
    private lightNovelService = inject(LightNovelService);

    genreName = input.required<string>(); // Depuis l'URL
    genreNameFormatted = computed(() => {
        const route = this.genreName();
        return genreRouteToName[route] ?? route;
    })

    // toObservable() convertit le Signal en Observable
    // switchMap appelle le service à chaque changement de genreName
    // switchMap remplace l'Observable 'toObservable(this.genreName)' par l'Observable 'this.lightNovelService.getLightNovelsByGenre(genre)'
    lightNovels = toSignal(
        toObservable(this.genreName).pipe(
            switchMap(genre => {
                const apiGenre = getGenreApiValue(genre);
                return this.lightNovelService.getLightNovelsByGenre(apiGenre).pipe(
                    catchError((error) => {
                        if (!environment.production) {
                            console.error(error);
                        }
                        return of([]);
                    })
                );
            })
        ),
        { initialValue: [] as LightNovel[] }
    );

    constructor() {
        effect(() => {
            const genre = this.genreName();
            const genreToLower = genre.toLowerCase();

            if (genre !== genreToLower) {
                this.router.navigate(['/genre', genreToLower], { replaceUrl: true });
                return;
            }

            if (!availableGenres.includes(genreToLower)) {
                this.router.navigate(['/error/404']);
            }
        });
    }
}
