import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmField, HlmFieldGroup, HlmFieldLabel } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { LoginInput } from '../../../../models/LoginInput';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-login-form',
    imports: [
        HlmField,
        HlmFieldGroup,
        HlmFieldLabel,
        HlmInput,
        HlmButton,
        RouterLink,
        ReactiveFormsModule,
    ],
    templateUrl: './login-form.html',
    styleUrl: './login-form.css',
})
export class LoginForm {
    private router = inject(Router);
    private authService = inject(AuthService);
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
    });
    errorMessage = signal<string>('');
    isLoading = signal(false);

    handleSubmit() {
        if (this.loginForm.valid) {
            const loginInput: LoginInput = {
                email: this.loginForm.get('email')?.value!,
                password: this.loginForm.get('password')?.value!,
            };

            this.isLoading.set(true);
            this.authService.login(loginInput).subscribe({
                next: (response) => {
                    if (!environment.production) {
                        console.log('Login successful:', response);
                    }
                    this.isLoading.set(false);
                    this.router.navigate(['/']);
                },
                error: (error) => {
                    if (!environment.production) {
                        console.error('Login error:', error);
                    }
                    this.isLoading.set(false);
                    this.errorMessage.set('Invalid email or password. Please try again.');
                },
            });
        }
    }
}
