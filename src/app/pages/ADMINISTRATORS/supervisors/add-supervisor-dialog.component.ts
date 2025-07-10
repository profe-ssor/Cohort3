import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { SupervisorService } from '../../../services/supervisors';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-supervisor-dialog',
  standalone: true,
  templateUrl: './add-supervisor-dialog.component.html',
  styleUrl: './add-supervisor-dialog.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AddSupervisorDialogComponent {
  step: number = 1; // 1: Register, 2: OTP, 3: Supervisor DB
  isLoading = false;
  error: string = '';
  success: string = '';

  // Step 1: Registration
  registerForm: FormGroup;
  registeredUserId: number | null = null;
  registeredEmail: string = '';

  // Step 2: OTP
  otpForm: FormGroup;

  // Step 3: Supervisor DB
  supervisorForm: FormGroup;
  regions: any[] = [];
  workplaces: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddSupervisorDialogComponent>,
    private authService: AuthService,
    private supervisorService: SupervisorService,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.otpForm = this.fb.group({
      otp_code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      email: ['', [Validators.required, Validators.email]]
    });
    this.supervisorForm = this.fb.group({
      full_name: ['', Validators.required],
      ghana_card_record: ['', Validators.required],
      contact: ['', Validators.required],
      assigned_region: ['', Validators.required],
      assigned_workplace: ['', Validators.required],
    });
    this.loadRegionsAndWorkplaces();
  }

  loadRegionsAndWorkplaces() {
    this.http.get<any[]>(environment.API_URL + 'regions/').subscribe({
      next: (data) => { this.regions = data; },
      error: () => { this.regions = []; }
    });
    this.http.get<any[]>(environment.API_URL + 'workplaces/').subscribe({
      next: (data) => { this.workplaces = data; },
      error: () => { this.workplaces = []; }
    });
  }

  // Step 1: Register Supervisor User
  submitRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.error = '';
    const payload = {
      ...this.registerForm.value,
      user_type: 'supervisor'
    };
    this.authService.register(payload).subscribe({
      next: (res) => {
        this.registeredUserId = res.id;
        this.registeredEmail = res.user.email;
        this.otpForm.patchValue({ email: res.user.email });
        this.success = res.message;
        this.step = 2;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Registration failed.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  // Step 2: OTP Verification
  submitOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading = true;
    this.error = '';
    this.authService.verifyOtp(this.otpForm.value).subscribe({
      next: (res) => {
        this.success = res.message;
        this.step = 3;
      },
      error: (err) => {
        this.error = err?.error?.error || 'OTP verification failed.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  // Step 3: Supervisor DB
  submitSupervisorDb() {
    if (this.supervisorForm.invalid || !this.registeredUserId) return;
    this.isLoading = true;
    this.error = '';
    const payload = {
      user_id: this.registeredUserId,
      ...this.supervisorForm.value
    };
    this.supervisorService.addSupervisor(payload).subscribe({
      next: (res) => {
        this.success = 'Supervisor created successfully!';
        this.dialogRef.close('success');
      },
      error: (err) => {
        this.error = err?.error?.error || 'Supervisor DB creation failed.';
      },
      complete: () => { this.isLoading = false; }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
