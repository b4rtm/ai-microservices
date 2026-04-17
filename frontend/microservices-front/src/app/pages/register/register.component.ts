import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../Interfaces/AuthInterfaces';
import { RegisterService } from '../../services/register.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  isSubmitting = false;

  constructor(
    private readonly registerService: RegisterService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  register(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.toastService.warning('Email and password are required.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.warning('Passwords do not match.');
      return;
    }

    const payload: RegisterRequest = {
      email: this.email.trim(),
      password: this.password,
    };

    this.isSubmitting = true;
    this.registerService.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Registration successful. You are now signed in.');
        void this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        const message = this.resolveErrorMessage(error);
        this.toastService.error(message);
      },
    });
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    if (!error.error) {
      return 'Registration failed. Please try again.';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.error.message === 'string') {
      return error.error.message;
    }

    return 'Registration failed. Please try again.';
  }
}
