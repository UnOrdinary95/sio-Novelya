import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { UserService } from '../user/user.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { ApiResponse } from '../../models/ApiResponse';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    private userService: UserService = inject(UserService);

    cartLength = computed(() => this.userService.currentUser()?.cart?.length ?? 0);

    updateCart(lightNovelId: string, quantity: number): Observable<ApiResponse> {
        return this.http.patch<ApiResponse>(
            `${this.apiUrl}/users/${this.userService.currentUser()?._id}/cart`,
            { lightNovelId, quantity }
        ).pipe(
            tap(() => this.userService.refreshCurrentUser())
        );
    }
}
