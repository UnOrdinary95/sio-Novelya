import { Component, inject, Signal, computed, signal } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideLogIn,
    lucideUserPlus,
    lucideSearch,
    lucideLogOut,
    lucideShoppingCart,
    lucidePlus,
    lucideUpload,
    lucideChevronDown,
} from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user/user.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { LightNovelService } from '../../../core/services/lightnovel/lightnovel.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmDialogImports } from '@shared/libs/ui/dialog/src';
import { BrnDialogImports, BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmLabelImports } from '@shared/libs/ui/label/src';
import { HlmField } from '@shared/libs/ui/field/src';
import { HlmSwitchImports } from '@shared/libs/ui/switch/src';
import { HlmBadge } from '@shared/libs/ui/badge/src';
import { HlmCalendarImports } from '@shared/libs/ui/calendar/src';
import { HlmPopoverImports } from '@shared/libs/ui/popover/src';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { toast } from 'ngx-sonner';
import { switchMap, of } from 'rxjs';
import { LightNovel, availableGenres as genres } from '../../../core/models/LightNovel';
import { getUserInitials } from '@shared/helpers/user.helper';

@Component({
    selector: 'app-header',
    imports: [
        HlmButton,
        HlmIcon,
        HlmInput,
        NgIcon,
        RouterLink,
        ReactiveFormsModule,
        HlmAvatarImports,
        HlmDialogImports,
        BrnDialogImports,
        HlmLabelImports,
        HlmField,
        HlmSwitchImports,
        HlmBadge,
        HlmCalendarImports,
        HlmPopoverImports,
        BrnPopoverImports
    ],
    templateUrl: './header.html',
    styleUrl: './header.css',
    providers: [
        provideIcons({
            lucideLogIn,
            lucideUserPlus,
            lucideSearch,
            lucideLogOut,
            lucideShoppingCart,
            lucidePlus,
            lucideUpload,
            lucideChevronDown,
        }),
    ],
})
export class Header {
    private router = inject(Router);
    private cartService = inject(CartService);
    private lightNovelService = inject(LightNovelService);
    authService = inject(AuthService);
    userService = inject(UserService);
    isAuthenticated: Signal<boolean> = this.authService.isAuthenticated;
    cartLength = this.cartService.cartLength;

    isAdmin = computed(() => this.userService.currentUser()?.isAdmin ?? false);

    userInitials = computed(() => getUserInitials(this.userService.currentUser()?.name));

    searchForm = new FormGroup({
        searchQuery: new FormControl(''),
    });

    // Formulaire de création Admin
    createForm = new FormGroup({
        title: new FormControl('', Validators.required),
        author: new FormControl('', Validators.required),
        price: new FormControl(0, [Validators.required, Validators.min(0)]),
        inStock: new FormControl(true),
        description: new FormControl(''),
        releaseDate: new FormControl<Date | null>(null),
        genres: new FormControl<string[]>([]),
    });

    previewCover = signal<string | null>(null);
    selectedCoverFile = signal<File | null>(null);
    availableGenres = genres;

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/']),
        });
    }

    onSubmit() {
        const searchQuery = this.searchForm.get('searchQuery')?.value?.trim();
        if (!searchQuery) return;

        this.router.navigate(['/search', searchQuery]);
    }

    triggerFileInput() {
        document.getElementById('createCoverInput')?.click();
    }

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

    toggleGenre(genre: string) {
        const genres = this.createForm.controls.genres.value || [];
        const index = genres.indexOf(genre);
        if (index === -1) {
            this.createForm.controls.genres.setValue([...genres, genre]);
        } else {
            this.createForm.controls.genres.setValue(genres.filter((g) => g !== genre));
        }
    }

    isGenreSelected(genre: string): boolean {
        return this.createForm.controls.genres.value?.includes(genre) ?? false;
    }

    createLightNovel(dialogRef: BrnDialogRef) {
        if (this.createForm.invalid) {
            toast.error('Please fill in all required fields');
            return;
        }

        const lightNovelData: Partial<LightNovel> = {
            title: this.createForm.controls.title.value!,
            author: this.createForm.controls.author.value!,
            price: this.createForm.controls.price.value!,
            inStock: this.createForm.controls.inStock.value!,
            description: this.createForm.controls.description.value || '',
            releaseDate: this.createForm.controls.releaseDate.value || new Date(),
            genres: this.createForm.controls.genres.value || [],
        };

        this.lightNovelService.createLightNovel(lightNovelData as LightNovel).pipe(
            switchMap((createdLN) => {
                if (this.selectedCoverFile()) {
                    return this.lightNovelService.patchCover(createdLN._id!, this.selectedCoverFile()!);
                }
                return of(createdLN);
            })
        ).subscribe({
            next: (createdLN) => {
                toast.success('Light novel created successfully!');
                this.resetCreateForm();
                dialogRef.close();
                this.router.navigate(['/lightnovel', createdLN._id]);
            },
            error: (err) => {
                toast.error('Failed to create light novel');
                console.error(err);
            },
        });
    }

    private resetCreateForm() {
        this.createForm.reset({
            title: '',
            author: '',
            price: 0,
            inStock: true,
            description: '',
            releaseDate: null,
            genres: [],
        });
        this.previewCover.set(null);
        this.selectedCoverFile.set(null);
    }
}
