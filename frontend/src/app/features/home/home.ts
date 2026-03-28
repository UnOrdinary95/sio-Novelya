import { Component, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GenreList } from './components/genre-list/genre-list';
import { lucideBookOpen } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LightnovelList } from '@shared/components/lightnovel-list/lightnovel-list';
import { LightNovel } from '@core/models/LightNovel';
import { LightNovelService } from '@core/services/lightnovel/lightnovel.service';
import { environment } from '@environments/environment';
import { catchError, of } from 'rxjs';

@Component({
    selector: 'app-home',
    imports: [GenreList, NgIcon, LightnovelList],
    templateUrl: './home.html',
    styleUrl: './home.css',
    providers: [
        provideIcons({
            lucideBookOpen,
        }),
    ]
})
export class Home {
    currentUrl = signal<string>('/genres/action.jpg');
    private lightNovelService = inject(LightNovelService);

    // toSignal() convertit automatiquement l'Observable en Signal
    // Plus besoin de ngOnInit, loadLightNovels(), subscribe(), etc.
    lightNovels = toSignal(
        this.lightNovelService.getLightNovels().pipe(
            catchError((error) => {
                if (!environment.production) {
                    console.error(error);
                }
                return of([]); // Retourne un tableau vide en cas d'erreur
            })
        ),
        { initialValue: [] as LightNovel[] }
    );

    /*
    // ===== ANCIENNE VERSION (avec subscribe manuel) =====
    // Gardée en commentaire pour référence

    lightNovels = signal<LightNovel[]>([]);

    ngOnInit(): void {
        this.loadLightNovels();
    }

    loadLightNovels(): void {
        this.lightNovelService.getLightNovels().subscribe({
            next: (lightNovels) => {
                this.lightNovels.set(lightNovels);
            },
            error: (error) => {
                if (!environment.production) {
                    console.error(error);
                }
            }
        });
    }
    // ===== FIN ANCIENNE VERSION =====
    */

    // $event est la valeur émise par le output (ici, une URL d'image)
    updateBackground(imageUrl: string) {
        this.currentUrl.set('/' + imageUrl);
    }
}
