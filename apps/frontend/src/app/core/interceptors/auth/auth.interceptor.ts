import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Routes back end qui n'ont pas besoin d'authentification
    const isExcluded =
        (req.method === 'POST' && req.url.includes('/register')) ||
        (req.method === 'GET' && req.url.includes('/lightnovels'));

    if (isExcluded) {
        return next(req); // Ne pas modifier la requête pour les routes exclues
    }

    const authReq = req.clone({
        withCredentials: true, // Sans ça, les cookies ne sont pas envoyés avec la requête au serveur
    });

    return next(authReq).pipe(
        catchError((error) => {
            // Intercepter les erreurs 401 Unauthorized
            if (error.status === 401) {
                authService.logout().subscribe(); // Mettre à jour les signaux d'authentification si erreur 401
                // Eviter la redirection dès le chargement de l'application
                if (!req.url.includes('/users/me')) {
                    router.navigate(['/auth/login']); // Rediriger vers la page de connexion
                }
            }
            return throwError(() => error);
        }),
    );
};
