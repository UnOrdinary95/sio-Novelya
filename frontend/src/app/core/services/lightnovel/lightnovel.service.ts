import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LightNovel } from '../../models/LightNovel';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class LightNovelService {
    private http: HttpClient = inject(HttpClient);
    private apiUrl: string = environment.apiUrl;
    private location: Location = inject(Location);

    createLightNovel(lightNovel: LightNovel): Observable<LightNovel> {
        return this.http.post<LightNovel>(`${this.apiUrl}/lightnovels`, lightNovel);
    }

    getLightNovels(): Observable<LightNovel[]> {
        return this.http.get<LightNovel[]>(`${this.apiUrl}/lightnovels`);
    }

    getLightNovelsByGenre(genreName: string): Observable<LightNovel[]> {
        return this.http.get<LightNovel[]>(`${this.apiUrl}/lightnovels/genre/${genreName.toLowerCase()}`);
    }

    getLightNovelsByName(name: string): Observable<LightNovel[]> {
        return this.http.get<LightNovel[]>(`${this.apiUrl}/lightnovels/search/${name}`);
    }

    getLightNovelById(id: string): Observable<LightNovel> {
        return this.http.get<LightNovel>(`${this.apiUrl}/lightnovels/${id}`);
    }

    updateLightNovel(id: string, lightNovel: LightNovel): Observable<LightNovel> {
        return this.http.put<LightNovel>(`${this.apiUrl}/lightnovels/${id}`, lightNovel);
    }

    patchCover(id: string, cover: File): Observable<LightNovel> {
        const formData = new FormData();
        formData.append('cover', cover);
        return this.http.patch<LightNovel>(`${this.apiUrl}/lightnovels/${id}/cover`, formData);
    }

    deleteLightNovel(id: string): Observable<LightNovel> {
        return this.http.delete<LightNovel>(`${this.apiUrl}/lightnovels/${id}`).pipe(
            tap(() => this.location.back())
        );
    }
}
