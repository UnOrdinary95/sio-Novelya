import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideShoppingBag } from '@ng-icons/lucide';
import { UserService } from '@core/services/user/user.service';
import { CartService } from '@core/services/cart/cart.service';
import { LightNovelService } from '@core/services/lightnovel/lightnovel.service';
import { CartItem } from '@core/models/CartItem';
import { CartItemWithDetails } from '@core/models/CartItemWithDetails';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-cart',
    imports: [CommonModule, CurrencyPipe, RouterLink, HlmButton, HlmIcon, NgIcon],
    templateUrl: './cart.html',
    styleUrl: './cart.css',
    providers: [
        provideIcons({
            lucideTrash2,
            lucideShoppingBag,
        }),
    ],
})
export class Cart {
    private userService = inject(UserService);
    private cartService = inject(CartService);
    private lightNovelService = inject(LightNovelService);

    cartItems = signal<CartItemWithDetails[]>([]);
    isLoading = signal<boolean>(true);

    isEmpty = computed<boolean>(() => this.cartItems().length === 0);

    total = computed<number>(() => {
        return this.cartItems().reduce((sum, item) => {
            return sum + (item.lightNovel.price * item.cartItem.quantity);
        }, 0);
    });

    constructor() {
        effect(() => {
            const cart = this.userService.currentUser()?.cart ?? [];
            this.loadCartDetails(cart);
        });
    }

    private loadCartDetails(cart: CartItem[]): void {
        if (cart.length === 0) {
            this.cartItems.set([]);
            this.isLoading.set(false);
            return;
        }

        const requests = cart.map(cartItem =>
            this.lightNovelService.getLightNovelById(cartItem.lightNovelId)
        );

        // forkJoin attend que tt les requêtes soient finies (l'équivalent de Promise.all pour Observables)
        forkJoin(requests).subscribe({
            next: (lightNovels) => {
                const itemsWithDetails: CartItemWithDetails[] = cart.map((cartItem, index) => ({
                    cartItem,
                    lightNovel: lightNovels[index],
                }));
                this.cartItems.set(itemsWithDetails);
                this.isLoading.set(false);
            },
            error: () => {
                toast.error('Failed to load cart items');
                this.isLoading.set(false);
            },
        });
    }

    removeFromCart(item: CartItemWithDetails): void {
        const id = item.lightNovel._id;
        if (!id) return;

        this.cartService.updateCart(id, -item.cartItem.quantity).subscribe({
            next: () => {
                toast.success('Removed from cart', {
                    description: item.lightNovel.title,
                });
            },
            error: () => {
                toast.error('Failed to remove item', {
                    description: 'Please try again later',
                });
            },
        });
    }

    completePurchase(): void {
        this.userService.updatePurchaseHistory().subscribe({
            next: () => {
                toast.success('Purchase completed!', {
                    description: 'Thank you for your order.',
                });
            },
            error: () => {
                toast.error('Failed to complete purchase', {
                    description: 'Please try again later.',
                });
            },
        });
    }
}
