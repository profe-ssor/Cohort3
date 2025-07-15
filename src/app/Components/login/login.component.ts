import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Constant } from '../../constant/constant';
import { NgIf } from '@angular/common';
import { Credentials, LoginResponse } from '../../model/interface/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterOutlet, RouterLink],
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

  constructor(private authService: AuthService, private router: Router, private _toastr:ToastrService) {}

  onLogin() {
    if (this.isLoading) return;

    // Clear any existing tokens before login attempt
    this.clearExistingTokens();

    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response: LoginResponse) => {
        this.successMessage = response.message;
        this._toastr.success(this.successMessage, 'Login Successful')
        console.log('Logged in successfully:', response);

        // Store user id and user_type in localStorage for profile page
        if (response && response.user) {
          // Only store id if it exists
          if ('id' in response.user && response.user.id) {
            localStorage.setItem('user_id', String(response.user.id));
          }
          // Only store user_type if it exists, otherwise use role
          if ('user_type' in response.user && response.user.user_type) {
            localStorage.setItem('user_type', String(response.user.user_type));
          } else if ('role' in response.user && response.user.role) {
            localStorage.setItem('user_type', String(response.user.role));
          }
        } else {
          console.warn('No user object in login response:', response);
        }
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

  private clearExistingTokens(): void {
    // Clear any existing tokens to ensure clean login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user_full_name');
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


    this._toastr.error(this.errorMessage, 'Login Failed');
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
