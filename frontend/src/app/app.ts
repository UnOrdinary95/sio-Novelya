import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/services/auth/auth.service';
import { HlmToaster } from './shared/libs/ui/sonner/src';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, HlmToaster],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    private router = inject(Router);
    private authService = inject(AuthService);
    showHeader = signal(true); // true = afficher header, false = masquer header

    constructor() {
        this.router.events // Observation des événements du router (Observable)
            // Événements possibles :
            // NavigationStart (navigation commence)
            // NavigationEnd (navigation réussit)
            // NavigationCancel (navigation annulée, ex. par les guards)
            // NavigationError (navigation échoue)
            .pipe(filter((event) => event instanceof NavigationEnd)) // Seulement NavigationEnd (événements réussis)
            .subscribe(() => {
                // S'abonner aux événements filtrés (chaque événement est un NavigationEnd)
                // Pas de header si on est sur une route d'authentification ou d'erreur
                this.showHeader.set(
                    !this.router.url.startsWith('/auth') && !this.router.url.startsWith('/error'),
                );
            });
    }
}
