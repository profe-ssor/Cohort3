import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ghost-resolution-dialog',
  standalone: true,
  template: `
    <div class="overlay">
      <div class="overlay-dialog-card">
        <button class="close-btn" (click)="onCancel()" aria-label="Close dialog">&times;</button>
        <div class="overlay-icon">👻</div>
        <h2 class="overlay-title">Resolve Ghost Detection</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="overlay-resolution-form">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Resolution Type</mat-label>
            <mat-select formControlName="resolution_type" required>
              <mat-option value="resolved">Resolved</mat-option>
              <mat-option value="false_positive">False Positive</mat-option>
              <mat-option value="disciplinary_action">Disciplinary Action</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Action Taken</mat-label>
            <input matInput formControlName="action_taken" required placeholder="E.g., Warning issued, Removed from list" />
          </mat-form-field>
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Resolution Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3" placeholder="Add any additional notes..."></textarea>
          </mat-form-field>
          <div class="overlay-dialog-actions">
            <button mat-stroked-button color="primary" type="button" (click)="onCancel()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Submit</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(24, 28, 38, 0.55);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInOverlay 0.3s cubic-bezier(.4,0,.2,1);
    }
    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .overlay-dialog-card {
      background: rgba(255,255,255,0.92);
      border-radius: 18px;
      box-shadow: 0 12px 48px 0 rgba(25, 118, 210, 0.18), 0 2px 8px rgba(0,0,0,0.10);
      min-width: 340px;
      max-width: 420px;
      width: 100%;
      padding: 36px 32px 28px 32px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(6px);
      border: 1.5px solid #e3e9f6;
      animation: floatInDialog 0.4s cubic-bezier(.4,0,.2,1);
    }
    @keyframes floatInDialog {
      from { opacity: 0; transform: translateY(40px) scale(0.98); }
      to { opacity: 1; transform: none; }
    }
    .close-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      background: none;
      border: none;
      font-size: 2rem;
      color: #444;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      z-index: 10;
    }
    .close-btn:hover {
      opacity: 1;
      color: #1976d2;
    }
    .overlay-icon {
      font-size: 3.2rem;
      margin-bottom: 8px;
      filter: drop-shadow(0 2px 8px rgba(25,118,210,0.10));
      text-shadow: 0 2px 8px rgba(25,118,210,0.10);
    }
    .overlay-title {
      margin: 0 0 18px 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #222b45;
      letter-spacing: 0.01em;
      text-align: center;
    }
    .overlay-resolution-form {
      display: flex;
      flex-direction: column;
      gap: 22px;
      width: 100%;
      margin-top: 0;
    }
    .full-width { width: 100%; }
    .mat-form-field {
      background: #f4f7fb;
      border-radius: 7px;
      box-shadow: 0 1px 2px rgba(25,118,210,0.03);
    }
    .mat-form-field-appearance-fill .mat-form-field-flex {
      background: transparent;
      border-radius: 7px;
    }
    .mat-form-field-appearance-fill .mat-form-field-outline {
      color: #1976d2;
    }
    .mat-form-field.mat-focused .mat-form-field-outline {
      color: #1565c0;
      border-color: #1565c0;
    }
    .mat-form-field.mat-focused .mat-form-field-label {
      color: #1976d2;
    }
    .mat-form-field.mat-focused .mat-input-element {
      color: #1976d2;
    }
    .overlay-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 22px;
    }
    button[mat-flat-button], button[mat-stroked-button] {
      min-width: 110px;
      font-weight: 600;
      letter-spacing: 0.01em;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(25,118,210,0.07);
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    }
    button[mat-flat-button]:hover {
      background: #1565c0;
      color: #fff;
    }
    button[mat-stroked-button]:hover {
      border-color: #1976d2;
      color: #1976d2;
      background: #e3e9f6;
    }
    @media (max-width: 480px) {
      .overlay-dialog-card {
        min-width: 0;
        max-width: 98vw;
        padding: 18px 4px 12px 4px;
      }
      .overlay-resolution-form {
        padding: 0;
      }
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class GhostResolutionDialogComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GhostResolutionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      resolution_type: [data?.resolution_type || 'resolved', Validators.required],
      action_taken: [data?.action_taken || '', Validators.required],
      notes: [data?.notes || '']
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
