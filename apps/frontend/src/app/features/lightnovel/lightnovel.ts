import { Component, inject, input, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { LightNovel, availableGenres } from '@core/models/LightNovel';
import { LightNovelService } from '@core/services/lightnovel/lightnovel.service';
import { CartService } from '@core/services/cart/cart.service';
import { UserService } from '@core/services/user/user.service';
import { environment } from '@environments/environment';
import { HlmBadgeImports } from '@shared/libs/ui/badge/src';
import { HlmButton } from '@shared/libs/ui/button/src';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@shared/libs/ui/icon/src';
import { HlmDialogImports } from '@shared/libs/ui/dialog/src';
import { BrnDialogImports, BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@shared/libs/ui/alert-dialog/src';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { HlmInputImports } from '@shared/libs/ui/input/src';
import { HlmLabelImports } from '@shared/libs/ui/label/src';
import { HlmSwitchImports } from '@shared/libs/ui/switch/src';
import { HlmCheckboxImports } from '@shared/libs/ui/checkbox/src';
import { HlmCalendarImports } from '@shared/libs/ui/calendar/src';
import { HlmField } from '@shared/libs/ui/field/src';
import { HlmPopoverImports } from '@shared/libs/ui/popover/src';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { HlmSelectImports } from '@shared/libs/ui/select/src';
import { lucideShoppingCart, lucideArrowLeft, lucideCalendar, lucideUser, lucideStar, lucideCheck, lucideEdit, lucideTrash, lucideUpload, lucideChevronDown } from '@ng-icons/lucide';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-lightnovel',
    imports: [
        CommonModule,
        CurrencyPipe,
        DatePipe,
        RouterLink,
        ReactiveFormsModule,
        HlmBadgeImports,
        HlmButton,
        NgIcon,
        HlmIcon,
        HlmDialogImports,
        BrnDialogImports,
        HlmInputImports,
        HlmLabelImports,
        HlmSwitchImports,
        HlmCheckboxImports,
        HlmCalendarImports,
        HlmField,
        HlmPopoverImports,
        BrnPopoverImports,
        HlmSelectImports,
        HlmAlertDialogImports,
        BrnAlertDialogImports
    ],
    templateUrl: './lightnovel.html',
    styleUrl: './lightnovel.css',
    providers: [
        provideIcons({
            lucideShoppingCart,
            lucideArrowLeft,
            lucideCalendar,
            lucideUser,
            lucideStar,
            lucideCheck,
            lucideEdit,
            lucideTrash,
            lucideUpload,
            lucideChevronDown
        }),
    ],
})
export class Lightnovel {
    private router = inject(Router);
    private lightNovelService = inject(LightNovelService);
    private cartService = inject(CartService);
    private userService = inject(UserService);

    id = input.required<string>();

    lightNovel = toSignal(
        toObservable(this.id).pipe(
            switchMap(id =>
                this.lightNovelService.getLightNovelById(id).pipe(
                    catchError((error) => {
                        if (!environment.production) {
                            console.error(error);
                        }
                        this.router.navigate(['/error/404']);
                        return of(null);
                    })
                )
            )
        ),
        { initialValue: null as LightNovel | null }
    );

    isOutOfStock = computed(() => {
        const ln = this.lightNovel();
        return ln ? !ln.inStock : false;
    });

    isInCart = computed(() => {
        const cart = this.userService.currentUser()?.cart ?? [];
        const ln = this.lightNovel();
        return ln ? cart.some(item => item.lightNovelId === ln._id) : false;
    });

    isInWishlist = computed(() => {
        const wishlist = this.userService.currentUser()?.wishlist ?? [];
        const ln = this.lightNovel();
        return ln?._id ? wishlist.includes(ln._id) : false;
    });

    goBack(): void {
        window.history.back();
    }

    getGenreRoute(genre: string): string {
        return genre.toLowerCase().replace(/ /g, '-');
    }

    toggleCart() {
        if (!this.userService.currentUser()) {
            this.router.navigate(['/auth/login']);
            return;
        }

        const id = this.lightNovel()?._id;
        if (!id) return;

        const isRemoving = this.isInCart();
        const title = this.lightNovel()?.title ?? '';

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

        const id = this.lightNovel()?._id;
        if (!id) return;

        const isRemoving = this.isInWishlist();
        const title = this.lightNovel()?.title ?? '';

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

    // Logique Admin
    isAdmin = computed(() => this.userService.currentUser()?.isAdmin || false);
    availableGenres = availableGenres;

    editForm = new FormGroup({
        title: new FormControl('', Validators.required),
        author: new FormControl('', Validators.required),
        price: new FormControl(0, [Validators.required, Validators.min(0)]),
        inStock: new FormControl(false),
        description: new FormControl(''),
        genres: new FormControl<string[]>([]),
        releaseDate: new FormControl<Date | null>(null)
    });

    previewCover = signal<string | null>(null);

    openAdminModal() {
        const ln = this.lightNovel();
        if (ln) {
            this.editForm.patchValue({
                title: ln.title,
                author: ln.author,
                price: ln.price,
                inStock: ln.inStock,
                description: ln.description,
                genres: ln.genres || [],
                releaseDate: ln.releaseDate ? new Date(ln.releaseDate) : null
            });
            this.previewCover.set(ln.cover);
        }
    }

    selectedCoverFile = signal<File | null>(null);

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.selectedCoverFile.set(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewCover.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    triggerFileInput() {
        document.getElementById('coverInput')?.click();
    }

    toggleGenre(genre: string) {
        const currentGenres = this.editForm.value.genres || [];
        const index = currentGenres.indexOf(genre);
        let newGenres: string[];

        if (index === -1) {
            newGenres = [...currentGenres, genre];
        } else {
            newGenres = currentGenres.filter(g => g !== genre);
        }

        this.editForm.patchValue({ genres: newGenres });
    }

    isGenreSelected(genre: string): boolean {
        return (this.editForm.value.genres || []).includes(genre);
    }

    updateLightNovel(dialogRef: BrnDialogRef) {
        if (!this.editForm.valid) {
            toast.error('Please fill in all required fields');
            return;
        }

        const id = this.lightNovel()?._id;
        if (!id) return;

        const updatedData: Partial<LightNovel> = {
            title: this.editForm.controls.title.value!,
            author: this.editForm.controls.author.value!,
            price: this.editForm.controls.price.value!,
            inStock: this.editForm.controls.inStock.value!,
            description: this.editForm.controls.description.value || '',
            releaseDate: this.editForm.controls.releaseDate.value || undefined,
            genres: this.editForm.controls.genres.value || [],
        };

        // Peut être refactorisé avec switchMap
        this.lightNovelService.updateLightNovel(id, updatedData as LightNovel).subscribe({
            next: () => {
                // Si une image de couverture est sélectionnée, on la met à jour
                if (this.selectedCoverFile()) {
                    this.lightNovelService.patchCover(id, this.selectedCoverFile()!).subscribe({
                        next: () => {
                            toast.success('Light novel updated successfully!');
                            dialogRef.close();
                            // Rafraîchir la page pour afficher les données mises à jour
                            window.location.reload();
                        },
                        error: (err) => {
                            toast.error('Failed to update cover');
                            console.error(err);
                        }
                    });
                } else {
                    toast.success('Light novel updated successfully!');
                    dialogRef.close();
                    window.location.reload();
                }
            },
            error: (err) => {
                toast.error('Failed to update light novel');
                console.error(err);
            },
        });
    }

    deleteLightNovel() {
        const id = this.lightNovel()?._id;
        if (!id) return;

        this.lightNovelService.deleteLightNovel(id).subscribe({
            next: () => {
                toast.success('Light novel deleted successfully!');
            },
            error: (err) => {
                toast.error('Failed to delete light novel');
                console.error(err);
            },
        });
    }
}
