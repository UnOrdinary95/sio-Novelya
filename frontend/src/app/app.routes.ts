import { Routes } from '@angular/router';
import { Login } from './core/pages/login/login';
import { Register } from './core/pages/register/register';
import { Error404 } from './core/pages/error/error404/error404';
import { Error403 } from './core/pages/error/error403/error403';
import { Home } from './features/home/home';
import { Genre } from './features/genre/genre';
import { Search } from './features/search/search';
import { Lightnovel } from './features/lightnovel/lightnovel';
import { Cart } from './features/cart/cart';
import { Profile } from './features/profile/profile';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'genre/:genreName', component: Genre },
    { path: 'search/:searchQuery', component: Search },
    { path: 'lightnovel/:id', component: Lightnovel },
    { path: 'cart', component: Cart, canActivate: [authGuard] },
    { path: 'auth/login', component: Login },
    { path: 'auth/register', component: Register },
    { path: 'error/404', component: Error404 },
    { path: 'error/403', component: Error403 },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', redirectTo: 'error/404' },
];

