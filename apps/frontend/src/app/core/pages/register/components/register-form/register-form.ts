import { Component, inject, signal } from '@angular/core';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmButton } from '@spartan-ng/helm/button';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { RegisterInput } from '../../../../models/RegisterInput';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-register-form',
    imports: [
        HlmField,
        HlmFieldGroup,
        HlmFieldLabel,
        HlmInput,
        HlmCheckbox,
        HlmButton,
        RouterLink,
        ReactiveFormsModule,
    ],
    templateUrl: './register-form.html',
    styleUrl: './register-form.css',
})
export class RegisterForm {
    private router = inject(Router);
    private authService = inject(AuthService);
    registerForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern('^[a-zA-Z_\\- ]+$'),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [
            Validators.required,
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z]).{8,}$'),
        ]),
        terms: new FormControl(false, [Validators.requiredTrue]),
    });
    errorMessage = signal<string>('');
    isLoading = signal(false);

    handleSubmit() {
        if (this.registerForm.valid) {
            const registerInput: RegisterInput = {
                name: this.registerForm.value.name!.trim(),
                email: this.registerForm.value.email!.trim(),
                password: this.registerForm.value.password!,
            };

            this.isLoading.set(true);
            this.authService.register(registerInput).subscribe({
                next: (response) => {
                    if (!environment.production) {
                        console.log('Registration successful', response);
                    }
                    this.isLoading.set(false);
                    this.router.navigate(['/auth/login']);
                },
                error: (error) => {
                    if (!environment.production) {
                        console.error('Registration error', error);
                    }
                    this.isLoading.set(false);
                    if (error.status === 400) {
                        this.errorMessage.set(
                            'Registration failed please check your input and try again.',
                        );
                    } else if (error.status === 409) {
                        this.errorMessage.set('An account with this email already exists.');
                    } else {
                        this.errorMessage.set(
                            'An unexpected error occurred. Please try again later.',
                        );
                    }
                },
            });
        }
    }
}
