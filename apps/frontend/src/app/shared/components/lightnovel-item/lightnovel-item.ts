import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LightNovel } from '@core/models/LightNovel';
import { lucideStar, lucideShoppingCart, lucideCheck } from '@ng-icons/lucide';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { CartService } from '@core/services/cart/cart.service';
import { UserService } from '@core/services/user/user.service';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-lightnovel-item',
    imports: [CommonModule, CurrencyPipe, RouterLink, HlmBadgeImports, HlmCardImports, NgIcon, HlmButton, HlmIcon],
    templateUrl: './lightnovel-item.html',
    styleUrl: './lightnovel-item.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        provideIcons({
            lucideStar,
            lucideShoppingCart,
            lucideCheck,
        }),
    ]
})
export class LightnovelItem {
    private cartService = inject(CartService);
    private userService = inject(UserService);
    private router = inject(Router);

    lightNovel = input.required<LightNovel>();
    isOutOfStock = computed(() => !this.lightNovel().inStock);
    isInCart = computed(() => {
        const cart = this.userService.currentUser()?.cart ?? [];
        return cart.some(item => item.lightNovelId === this.lightNovel()._id);
    });

    isInWishlist = computed(() => {
        const wishlist = this.userService.currentUser()?.wishlist ?? [];
        const id = this.lightNovel()._id;
        return id ? wishlist.includes(id) : false;
    });

    toggleCart() {
        if (!this.userService.currentUser()) {
            this.router.navigate(['/auth/login']);
            return;
        }

        const id = this.lightNovel()._id;
        if (!id) return;

        const isRemoving = this.isInCart();
        const title = this.lightNovel().title;

        this.cartService.updateCart(id, isRemoving ? -1 : 1).subscribe({
            next: () => {
                toast.success(isRemoving ? 'Removed from cart' : 'Added to cart', {
                    description: title,
                });
            },
            error: () => {
                toast.error('Failed to update cart', {
                    description: 'Please try again later',
                });
            },
        });
    }

    toggleWishlist() {
        if (!this.userService.currentUser()) {
            this.router.navigate(['/auth/login']);
            return;
        }

        const id = this.lightNovel()._id;
        if (!id) return;

        const isRemoving = this.isInWishlist();
        const title = this.lightNovel().title;

        this.userService.updateWishlist(id).subscribe({
            next: () => {
                toast.success(isRemoving ? 'Removed from wishlist' : 'Added to wishlist', {
                    description: title,
                });
            },
            error: () => {
                toast.error('Failed to update wishlist', {
                    description: 'Please try again later',
                });
            },
        });
    }
}
