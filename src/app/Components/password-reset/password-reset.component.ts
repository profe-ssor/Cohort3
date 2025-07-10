import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  PasswordResetRequest,
  PasswordResetRequestResponse,
  PasswordResetConfirm,
  PasswordResetConfirmResponse
} from '../../model/interface/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="password-reset-container">
      <div class="password-reset-card">
        <div class="card-header">
          <h2>Reset Password</h2>
          <p>{{ step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password' }}</p>
        </div>

        <!-- Step 1: Request Reset -->
        <form *ngIf="step === 1" (ngSubmit)="requestReset()" #requestForm="ngForm" class="reset-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="resetRequest.email"
              required
              email
              class="form-control"
              [class.error]="showEmailError"
              placeholder="Enter your registered email"
            />
            <div *ngIf="showEmailError" class="error-message">
              Please enter a valid email address
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="goBack()"
              class="btn btn-secondary"
              [disabled]="isLoading"
            >
              Back to Login
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading || !requestForm.valid"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'Sending...' : 'Send Reset Code' }}
            </button>
          </div>
        </form>

        <!-- Step 2: Confirm Reset -->
        <form *ngIf="step === 2" (ngSubmit)="confirmReset()" #confirmForm="ngForm" class="reset-form">
          <div class="form-group">
            <label for="otpCode">Reset Code</label>
            <input
              type="text"
              id="otpCode"
              name="otpCode"
              [(ngModel)]="resetConfirm.otp_code"
              required
              maxlength="6"
              class="form-control"
              [class.error]="showOtpError"
              placeholder="Enter 6-digit code"
            />
            <div *ngIf="showOtpError" class="error-message">
              Please enter the 6-digit code sent to your email
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              [(ngModel)]="resetConfirm.new_password"
              required
              minlength="6"
              class="form-control"
              [class.error]="showNewPasswordError"
              placeholder="Enter new password"
            />
            <div *ngIf="showNewPasswordError" class="error-message">
              New password must be at least 6 characters long
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="resetConfirm.confirm_password"
              required
              class="form-control"
              [class.error]="showConfirmPasswordError"
              placeholder="Confirm new password"
            />
            <div *ngIf="showConfirmPasswordError" class="error-message">
              {{ confirmPasswordError }}
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="step = 1"
              class="btn btn-secondary"
              [disabled]="isLoading"
            >
              Back
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading || !confirmForm.valid"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
        </form>

        <!-- Resend Code Option -->
        <div *ngIf="step === 2" class="resend-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            (click)="resendCode()"
            class="btn-link"
            [disabled]="resendLoading"
          >
            {{ resendLoading ? 'Sending...' : 'Resend Code' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .password-reset-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .password-reset-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 40px;
      width: 100%;
      max-width: 500px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .card-header h2 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
      font-weight: 600;
    }

    .card-header p {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .reset-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .form-control {
      padding: 12px 16px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 4px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #e1e5e9;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e9ecef;
    }

    .resend-section {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e1e5e9;
    }

    .resend-section p {
      color: #666;
      margin-bottom: 10px;
    }

    .btn-link {
      background: none;
      border: none;
      color: #667eea;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
      font-size: 14px;
    }

    .btn-link:hover:not(:disabled) {
      color: #5a6fd8;
    }

    .btn-link:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .password-reset-card {
        padding: 30px 20px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PasswordResetComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  step = 1;
  isLoading = false;
  resendLoading = false;

  resetRequest: PasswordResetRequest = {
    email: ''
  };

  resetConfirm: PasswordResetConfirm = {
    email: '',
    otp_code: '',
    new_password: '',
    confirm_password: ''
  };

  // Error states
  showEmailError = false;
  showOtpError = false;
  showNewPasswordError = false;
  showConfirmPasswordError = false;
  confirmPasswordError = '';

  requestReset(): void {
    this.resetErrors();

    if (!this.resetRequest.email || !this.isValidEmail(this.resetRequest.email)) {
      this.showEmailError = true;
      return;
    }

    this.isLoading = true;

    this.authService.requestPasswordReset(this.resetRequest).subscribe({
      next: (response: PasswordResetRequestResponse) => {
        this.toastr.success(response.message, 'Success');
        this.resetConfirm.email = this.resetRequest.email;
        this.step = 2;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Password reset request error:', error);
        const errorMessage = error.error?.error || 'Failed to send reset code. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.isLoading = false;
      }
    });
  }

  confirmReset(): void {
    this.resetErrors();

    if (!this.resetConfirm.otp_code || this.resetConfirm.otp_code.length !== 6) {
      this.showOtpError = true;
      return;
    }

    if (!this.resetConfirm.new_password || this.resetConfirm.new_password.length < 6) {
      this.showNewPasswordError = true;
      return;
    }

    if (this.resetConfirm.new_password !== this.resetConfirm.confirm_password) {
      this.showConfirmPasswordError = true;
      this.confirmPasswordError = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    this.authService.confirmPasswordReset(this.resetConfirm).subscribe({
      next: (response: PasswordResetConfirmResponse) => {
        this.toastr.success(response.message, 'Success');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Password reset confirmation error:', error);
        const errorMessage = error.error?.error || 'Failed to reset password. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.isLoading = false;
      }
    });
  }

  resendCode(): void {
    this.resendLoading = true;

    this.authService.requestPasswordReset(this.resetRequest).subscribe({
      next: (response: PasswordResetRequestResponse) => {
        this.toastr.success('Reset code sent again', 'Success');
        this.resendLoading = false;
      },
      error: (error) => {
        console.error('Resend code error:', error);
        const errorMessage = error.error?.error || 'Failed to resend code. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.resendLoading = false;
      }
    });
  }

  private resetErrors(): void {
    this.showEmailError = false;
    this.showOtpError = false;
    this.showNewPasswordError = false;
    this.showConfirmPasswordError = false;
    this.confirmPasswordError = '';
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
