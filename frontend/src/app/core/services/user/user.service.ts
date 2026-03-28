import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../../models/User';
import { environment } from '@environments/environment';
import { AuthService } from '../auth/auth.service';
import { ApiResponse } from '../../models/ApiResponse';
import { UpdateUserInput } from '../../models/updateUserInput';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private http: HttpClient = inject(HttpClient);
    private apiUrl: string = environment.apiUrl;
    private authService: AuthService = inject(AuthService);

    // User en cache (null si pas connecté)
    currentUser = signal<User | null>(null);

    constructor() {
        effect(() => {
            if (this.authService.isAuthenticated()) {
                this.refreshCurrentUser();
            } else {
                this.currentUser.set(null);
            }
        });
    }

    refreshCurrentUser() {
        this.getMe().subscribe({
            next: (user) => this.currentUser.set(user),
            error: () => this.currentUser.set(null),
        });
    }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }

    getMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/me`);
    }

    updatePurchaseHistory(): Observable<ApiResponse> {
        return this.http.patch<ApiResponse>(`${this.apiUrl}/users/${this.currentUser()?._id}/history`, {}).pipe(
            tap(() => this.refreshCurrentUser())
        );
    }

    updateWishlist(lightNovelId: string): Observable<ApiResponse> {
        return this.http.patch<ApiResponse>(`${this.apiUrl}/users/${this.currentUser()?._id}/wishlist`, { lightNovelId }).pipe(
            tap(() => this.refreshCurrentUser())
        );
    }

    updateProfile(newUserData: UpdateUserInput): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/users/${this.currentUser()?._id}`, newUserData);
    }

    deleteProfile(): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.apiUrl}/users/${this.currentUser()?._id}`).pipe(
            switchMap((response: ApiResponse) => this.authService.logout().pipe(
                // On utilise switchMap au lieu de tap car on veut que le logout se fasse après la suppression du profil
                map(() => response)
            ))
        );
    }
    
    updateUserById(userId: string, newUserData: UpdateUserInput): Observable<ApiResponse> {
        return this.http.put<ApiResponse>(`${this.apiUrl}/users/${userId}`, newUserData);
    }

    deleteUserById(userId: string): Observable<ApiResponse> {
        return this.http.delete<ApiResponse>(`${this.apiUrl}/users/${userId}`);
    }
}
