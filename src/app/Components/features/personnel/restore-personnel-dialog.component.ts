import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-restore-personnel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-card">
      <div class="dialog-title-bar">
        <span class="dialog-title">Restore Personnel</span>
        <button mat-icon-button class="close-btn" (click)="onCancel()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="restore-form">
        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" required />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Department</mat-label>
          <mat-select formControlName="department" required>
            <mat-option *ngFor="let dept of departments" [value]="dept.value">{{ dept.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Region</mat-label>
          <mat-select formControlName="region_of_posting_id" required>
            <mat-option *ngFor="let region of regions" [value]="region.id">{{ region.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="dialog-actions">
          <button mat-stroked-button color="primary" type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Restore</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      padding: 0;
      min-width: 360px;
      max-width: 420px;
      overflow: hidden;
    }
    .dialog-title-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1976d2; /* Material primary */
      color: #fff;
      padding: 18px 24px 14px 24px;
      font-size: 1.25rem;
      font-weight: 600;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    .dialog-title {
      flex: 1;
    }
    .close-btn {
      color: #fff;
      margin-right: -8px;
    }
    .restore-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 28px 24px 20px 24px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 18px;
    }
    @media (max-width: 480px) {
      .dialog-card {
        min-width: 0;
        max-width: 98vw;
      }
      .restore-form {
        padding: 18px 8px 12px 8px;
      }
      .dialog-title-bar {
        padding: 12px 8px 10px 8px;
      }
    }
  `]
})
export class RestorePersonnelDialogComponent implements OnInit {
  form: FormGroup;
  departments: { value: string, label: string }[] = [];
  regions: { id: number, name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private nssPersonnelService: NssPersonelService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<RestorePersonnelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      email: [data?.email || '', [Validators.required, Validators.email]],
      phone: [data?.phone || ''],
      department: [data?.department || '', Validators.required],
      region_of_posting_id: [data?.region_of_posting_id || '', Validators.required],
    });
  }

  ngOnInit() {
    this.nssPersonnelService.getDepartments().subscribe(departments => {
      this.departments = departments;
    });
    this.authService.getRegions().subscribe((regions: any[]) => {
      this.regions = regions;
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
