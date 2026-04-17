import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../Interfaces/AuthInterfaces';
import { LoginService } from '../../services/login.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitting = false;

  constructor(
    private readonly loginService: LoginService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  login(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.toastService.warning('Email and password are required.');
      return;
    }

    const payload: LoginRequest = {
      email: this.email.trim(),
      password: this.password,
    };

    this.isSubmitting = true;
    this.loginService.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Login successful. Welcome back.');
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
      return 'Login failed. Please try again.';
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (typeof error.error.message === 'string') {
      return error.error.message;
    }

    return 'Login failed. Please try again.';
  }
}
