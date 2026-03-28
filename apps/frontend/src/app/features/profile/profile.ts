import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user/user.service';
import { User } from '../../core/models/User';
import { AuthService } from '../../core/services/auth/auth.service';
import { toast } from 'ngx-sonner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmLabel } from '@spartan-ng/helm/label';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideSettings, lucideStar, lucideTrash, lucideUser, lucideMail, lucideLock, lucideShield } from '@ng-icons/lucide';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PurchaseHistoryItem } from '../../core/models/PurchaseHistoryItem';
import { UpdateUserInput } from '../../core/models/updateUserInput';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { LightNovel } from '../../core/models/LightNovel';
import { LightNovelService } from '../../core/services/lightnovel/lightnovel.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnrichedPurchaseHistoryItem } from '../../core/models/EnrichedPurchaseHistoryItem';
import { CartItemWithDetails } from '../../core/models/CartItemWithDetails';
import { getUserInitials } from '@shared/helpers/user.helper';

@Component({
    selector: 'app-profile',
    imports: [
        CommonModule, RouterLink, ReactiveFormsModule,
        HlmTabsImports,
        HlmDialogImports,
        HlmButton, HlmIcon, HlmInput, HlmLabel, HlmAvatarImports,
        BrnDialogImports,
        HlmAlertDialogImports,
        BrnAlertDialogImports,
        NgIcon,
        HlmField,
        HlmFieldGroup,
        HlmFieldLabel
    ],
    providers: [
        provideIcons({ lucideSettings, lucideStar, lucideTrash, lucideUser, lucideMail, lucideLock, lucideShield })
    ],
    templateUrl: './profile.html',
    styleUrl: './profile.css',
})
export class Profile {
    private userService = inject(UserService);
    private lnService = inject(LightNovelService);
    private router = inject(Router);
    private authService = inject(AuthService);

    user = this.userService.currentUser;

    initials = computed(() => getUserInitials(this.user()?.name));

    wishlistLNs = signal<LightNovel[]>([]);
    enrichedHistory = signal<EnrichedPurchaseHistoryItem[]>([]);

    // État admin
    allUsers = signal<User[]>([]);
    selectedUser = signal<User | null>(null);
    isAdminLoading = signal(false);
    adminErrorMessage = signal<string>('');

    adminEditForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern('^[a-zA-Z_\\- ]+$'),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
    });

    constructor() {
        effect(() => {
            const u = this.user();

            // Initialisation de la wishlist
            if (u && u.wishlist && u.wishlist.length > 0) {
                const uniqueIds = Array.from(new Set(u.wishlist));
                const reqs = uniqueIds.map(id => this.lnService.getLightNovelById(id).pipe(catchError(() => of(null))));

                if (reqs.length > 0) {
                    forkJoin(reqs).subscribe({
                        next: (result) => {
                            // Ignore les nulls
                            const lns = result.filter(ln => ln !== null) as LightNovel[];
                            this.wishlistLNs.set(lns);
                        },
                        error: () => this.wishlistLNs.set([])
                    });
                } else {
                    this.wishlistLNs.set([]);
                }
            } else {
                this.wishlistLNs.set([]);
            }

            // Initialisation de l'historique
            if (u && u.purchaseHistory && u.purchaseHistory.length > 0) {
                // Récupération des couvertures des premiers éléments de chaque commande
                const historyReqs = u.purchaseHistory.map(item => {
                    if (item.cart.length > 0) {
                        return this.lnService.getLightNovelById(item.cart[0].lightNovelId).pipe(
                            catchError(() => of(null))
                        );
                    }
                    return of(null);
                });

                if (historyReqs.length > 0) {
                    forkJoin(historyReqs).subscribe({
                        next: (covers) => {
                            const enriched = u.purchaseHistory.map((item, index) => ({
                                original: item,
                                firstItemCover: covers[index]?.cover || ''
                            }));

                            // Tri par date desc
                            enriched.sort((a, b) => new Date(b.original.purchaseDate).getTime() - new Date(a.original.purchaseDate).getTime());

                            this.enrichedHistory.set(enriched);
                        },
                        error: () => this.enrichedHistory.set([])
                    });
                }
            } else {
                this.enrichedHistory.set([]);
            }

            // Mise à jour du formulaire si les données de l'utilisateur sont chargées
            if (u) {
                this.settingsForm.patchValue({
                    name: u.name,
                    email: u.email
                });
            }
        });
    }

    settingsForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern('^[a-zA-Z_\\- ]+$'),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z]).{8,}$'),
        ]),
    });

    isLoading = signal(false);
    errorMessage = signal<string>('');

    handleSubmit() {
        if (this.settingsForm.valid) {
            this.isLoading.set(true);
            const updateInput: Partial<UpdateUserInput> = {
                name: this.settingsForm.value.name?.trim() || '',
                email: this.settingsForm.value.email?.trim() || '',
            };

            if (this.settingsForm.value.password) {
                updateInput.password = this.settingsForm.value.password;
            }

            this.userService.updateProfile(updateInput as UpdateUserInput).subscribe({
                next: (response) => {
                    toast.success(response?.message || 'Profile updated successfully. Please log in again.');
                    this.isLoading.set(false);
                    this.authService.logout().subscribe({
                        next: () => this.router.navigate(['/auth/login'])
                    });
                },
                error: (error) => {
                    this.isLoading.set(false);
                    if (error.status === 409) {
                        this.errorMessage.set('An account with this email already exists.');
                    } else {
                        this.errorMessage.set('Failed to update profile. Please try again.');
                    }
                    toast.error('Failed to update profile');
                }
            });
        }
    }

    deleteAccount() {
        this.userService.deleteProfile().subscribe({
            next: (response) => {
                toast.success(response?.message || 'Account deleted successfully');
                this.router.navigateByUrl('/').then((success) => {
                    if (!success) {
                        window.location.href = '/';
                    }
                });
            },
            error: () => {
                toast.error('Failed to delete account');
            }
        });
    }

    toggleWishlist(event: Event, lnId: string | undefined) {
        event.stopPropagation();
        event.preventDefault();
        if (!lnId) return;
        this.userService.updateWishlist(lnId).subscribe({
            next: (response) => {
                toast.success(response.message || 'Wishlist updated');
            },
            error: () => {
                toast.error('Failed to update wishlist');
            }
        });
    }

    selectedHistoryItem = signal<PurchaseHistoryItem | null>(null);
    selectedHistoryDetails = signal<CartItemWithDetails[]>([]);

    openHistoryDialog(item: PurchaseHistoryItem) {
        this.selectedHistoryItem.set(item);
        this.selectedHistoryDetails.set([]);

        if (item.cart.length > 0) {
            const reqs = item.cart.map(cartItem =>
                this.lnService.getLightNovelById(cartItem.lightNovelId)
            );

            forkJoin(reqs).subscribe(lns => {
                const details: CartItemWithDetails[] = item.cart.map((cartItem, index) => ({
                    cartItem,
                    lightNovel: lns[index]
                }));
                this.selectedHistoryDetails.set(details);
            });
        }
    }

    historyTotal = computed(() => {
        return this.selectedHistoryDetails().reduce((total, item) => {
            return total + (item.lightNovel.price * item.cartItem.quantity);
        }, 0);
    });

    // Méthodes admin
    loadAllUsers() {
        this.isAdminLoading.set(true);
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                // Filtrer les utilisateurs admin
                const nonAdminUsers = users.filter(u => !u.isAdmin);
                this.allUsers.set(nonAdminUsers);
                this.isAdminLoading.set(false);
            },
            error: () => {
                toast.error('Failed to load users');
                this.isAdminLoading.set(false);
            }
        });
    }

    openUserEditDialog(user: User) {
        this.selectedUser.set(user);
        this.adminErrorMessage.set('');
        this.adminEditForm.patchValue({
            name: user.name,
            email: user.email
        });
    }

    getUserInitials = getUserInitials;

    updateUser() {
        const user = this.selectedUser();
        if (!user || !user._id || this.adminEditForm.invalid) return;

        this.isAdminLoading.set(true);
        const updateInput: UpdateUserInput = {
            name: this.adminEditForm.value.name?.trim() || '',
            email: this.adminEditForm.value.email?.trim() || '',
        };

        this.userService.updateUserById(user._id, updateInput).subscribe({
            next: (response) => {
                toast.success(response?.message || 'User updated successfully');
                this.isAdminLoading.set(false);
                this.loadAllUsers();
            },
            error: (error) => {
                this.isAdminLoading.set(false);
                if (error.status === 409) {
                    this.adminErrorMessage.set('An account with this email already exists.');
                } else {
                    this.adminErrorMessage.set('Failed to update user. Please try again.');
                }
                toast.error('Failed to update user');
            }
        });
    }

    deleteUser() {
        const user = this.selectedUser();
        if (!user || !user._id) return;

        this.isAdminLoading.set(true);
        this.userService.deleteUserById(user._id).subscribe({
            next: (response) => {
                toast.success(response?.message || 'User deleted successfully');
                this.isAdminLoading.set(false);
                this.selectedUser.set(null);
                this.loadAllUsers();
            },
            error: () => {
                this.isAdminLoading.set(false);
                toast.error('Failed to delete user');
            }
        });
    }
}
