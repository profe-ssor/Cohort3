import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Constant } from '../../constant/constant';
import { NgIf } from '@angular/common';
import { Credentials } from '../../model/interface/auth';

interface LoginResponse {
  message: string; // Success message from the backend
  user?: {
    role: string; // User role, e.g., 'admin', 'supervisor', 'user'
  };
  tokens?: {
    access: string;  // Access token returned from the backend
    refresh: string; // Refresh token returned from the backend
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterOutlet],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;
  isLoginLoading = false;

  constant = Constant;
  credentials: Credentials = { email: '', password: '' };
  errorMessage: string = '';
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response: LoginResponse) => {
        this.successMessage = response.message;
        console.log('Logged in successfully:', response);

        },
      error: (error) => {
        console.error('Login error:', error);
        this.handleError(error);
        this.isLoading = false;
      },

      complete: () => {
        console.log('Login request completed.');
        this.isLoading = false;
      },

    });

  }

  private handleError(error: any) {
    // Log the full error to inspect any details
    console.log('Full error object:', error);

    // Handle error based on HTTP status or backend error
    if (error.status === 0) {
      this.errorMessage = 'Network error: Unable to reach the server. Please try again later.';
    } else if (error.status === 400) {
      // Try to extract the specific error message from the response
      this.errorMessage = error.error?.detail ||
                         error.error?.non_field_errors?.[0] ||
                         error.error?.error ||
                         'Login failed. Please check your credentials and try again.';
    } else if (error.status === 401) {
      this.errorMessage = error.error?.detail ||
                         error.error?.non_field_errors?.[0] ||
                         error.error?.error ||
                         'Invalid credentials. Please check your email and password.';
    } else if (error.status === 404) {
      this.errorMessage = 'User account not found. Please register first.';
    } else if (error.status === 500) {
      this.errorMessage = 'Internal server error. Please try again later.';
    } else {
      // Try to extract any error message before falling back to generic
      this.errorMessage = error.error?.detail ||
                         error.error?.message ||
                         error.message ||
                         'An unknown error occurred. Please try again.';
    }

    alert(this.errorMessage);
    console.error('Error details:', error);
  };

  onSignUp(): void {
    this.isLoginLoading = true;

    setTimeout(() => {
      this.isLoginLoading = false;
      this.router.navigate(['/signup']);
    }, 1000); // Simulates a short delay before navigating
  }
}
