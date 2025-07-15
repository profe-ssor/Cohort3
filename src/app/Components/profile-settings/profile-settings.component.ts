import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgIf,
  ],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isLoading = false;
  isPasswordLoading = false;
  userId: number | null = null;
  userType: string = '';
  userDetails: any = null;
  isEditMode = false;
  adminId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ProfileSettingsComponent initialized');
    // Get user info from localStorage or API
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    // Fallback: try to get id and user_type from separate keys if missing
    if (!user.id) {
      const id = localStorage.getItem('user_id');
      if (id) user.id = +id;
    }
    if (!user.user_type) {
      const userType = localStorage.getItem('user_type');
      if (userType) user.user_type = userType;
    }
    this.userId = user.id || null;
    this.userType = user.user_type || '';
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      user_type: [{ value: '', disabled: true }],
    });
    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
    });
    this.fetchProfile();
  }

  fetchProfile() {
    console.log('fetchProfile called, userId:', this.userId, 'userType:', this.userType);
    if (!this.userId) return;
    let url = '';
    if (this.userType === 'admin') {
      url = `${environment.API_URL}nss_admin/adminsdb/by_user/${this.userId}/`;
    } else if (this.userType === 'supervisor') {
      url = `${environment.API_URL}nss_supervisors/supervisorsdb/${this.userId}/`;
    } else {
      url = `${environment.API_URL}nss_personnel/personnel/${this.userId}/`;
    }
    this.isLoading = true;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        console.log('Profile data:', data); // Debug: log the received profile data
        this.userDetails = data;
        if (data && data.id) {
          this.adminId = data.id;
        }
        this.profileForm.patchValue({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || data.contact || '',
          gender: data.gender || '',
          user_type: data.user_type || '',
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  enterEditMode() {
    this.isEditMode = true;
  }

  saveProfile() {
    if (!this.userId) return;
    if (this.profileForm.invalid) return;
    let url = '';
    if (this.userType === 'admin') {
      url = `${environment.API_URL}nss_admin/adminsdb/${this.adminId}/`;
    } else if (this.userType === 'supervisor') {
      url = `${environment.API_URL}nss_supervisors/update/${this.userId}/`;
    } else {
      url = `${environment.API_URL}nss_personnel/update_personnel/${this.userId}/`;
    }
    this.isLoading = true;
    // Exclude user_type from update
    const updatePayload = { ...this.profileForm.getRawValue() };
    delete updatePayload.user_type;
    // Map phone to contact for admin and supervisor
    if (this.userType === 'admin' || this.userType === 'supervisor') {
      updatePayload.contact = updatePayload.phone;
      delete updatePayload.phone;
    }
    this.http.put<any>(url, updatePayload).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.isEditMode = false;
        this.fetchProfile();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    const payload = this.passwordForm.value;
    this.isPasswordLoading = true;
    this.http.post<any>(`${environment.API_URL}change-password/`, payload).subscribe({
      next: () => {
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        this.passwordForm.reset();
        this.isPasswordLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to change password', 'Close', { duration: 3000 });
        this.isPasswordLoading = false;
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    // Reset the form to the last loaded userDetails
    if (this.userDetails) {
      this.profileForm.patchValue({
        full_name: this.userDetails.full_name || '',
        email: this.userDetails.email || '',
        phone: this.userDetails.phone || this.userDetails.contact || '',
        gender: this.userDetails.gender || '',
        user_type: this.userDetails.user_type || '',
      });
    }
  }
}
