import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordChangeRequest, PasswordChangeResponse } from '../../model/interface/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="change-password-container">
      <div class="change-password-card">
        <div class="card-header">
          <h2>Change Password</h2>
          <p>Enter your current password and choose a new one</p>
        </div>

        <form (ngSubmit)="onSubmit()" #passwordForm="ngForm" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              [(ngModel)]="passwordData.current_password"
              required
              class="form-control"
              [class.error]="showCurrentPasswordError"
            />
            <div *ngIf="showCurrentPasswordError" class="error-message">
              Current password is required
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              [(ngModel)]="passwordData.new_password"
              required
              minlength="6"
              class="form-control"
              [class.error]="showNewPasswordError"
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
              [(ngModel)]="passwordData.confirm_password"
              required
              class="form-control"
              [class.error]="showConfirmPasswordError"
            />
            <div *ngIf="showConfirmPasswordError" class="error-message">
              {{ confirmPasswordError }}
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              (click)="goBack()"
              class="btn btn-secondary"
              [disabled]="isLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading || !passwordForm.valid"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'Changing Password...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .change-password-card {
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

    .password-form {
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
      .change-password-card {
        padding: 30px 20px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  passwordData: PasswordChangeRequest = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  isLoading = false;
  showCurrentPasswordError = false;
  showNewPasswordError = false;
  showConfirmPasswordError = false;
  confirmPasswordError = '';

  onSubmit(): void {
    this.resetErrors();

    // Validate form
    if (!this.passwordData.current_password) {
      this.showCurrentPasswordError = true;
      return;
    }

    if (!this.passwordData.new_password || this.passwordData.new_password.length < 6) {
      this.showNewPasswordError = true;
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.showConfirmPasswordError = true;
      this.confirmPasswordError = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    this.authService.changePassword(this.passwordData).subscribe({
      next: (response: PasswordChangeResponse) => {
        this.toastr.success(response.message, 'Success');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Password change error:', error);
        const errorMessage = error.error?.error || 'Failed to change password. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private resetErrors(): void {
    this.showCurrentPasswordError = false;
    this.showNewPasswordError = false;
    this.showConfirmPasswordError = false;
    this.confirmPasswordError = '';
  }

  goBack(): void {
    this.router.navigate(['/personnel/persneldashboard']);
  }
}
