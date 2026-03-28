import { LightNovel } from '@/app/core/models/LightNovel';
import { LightNovelService } from '@/app/core/services/lightnovel/lightnovel.service';
import { LightnovelList } from '@/app/shared/components/lightnovel-list/lightnovel-list';
import { environment } from '@/environments/environment';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-search',
    imports: [LightnovelList],
    templateUrl: './search.html',
    styleUrl: './search.css',
})
export class Search {
    private lightNovelService = inject(LightNovelService);
    searchQuery = input.required<string>();

    lightNovels = toSignal(
        toObservable(this.searchQuery).pipe(
            switchMap(query => this.lightNovelService.getLightNovelsByName(query).pipe(
                catchError((error) => {
                    if (!environment.production) {
                        console.error(error);
                    }
                    return of([]);
                })
            )
            )
        ),
        { initialValue: [] as LightNovel[] }
    );
}
