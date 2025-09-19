import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SupervisorService } from '../../../services/supervisors';
import { ISupervisorDatabase } from '../../../model/interface/supervisor';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { nss_database } from '../../../model/interface/auth';
import { MatSelectModule } from '@angular/material/select';
import { AddSupervisorDialogComponent } from './add-supervisor-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-supervisors',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatInputModule, ReactiveFormsModule, MatCheckboxModule, FormsModule, MatIconModule, MatDialogModule],
  templateUrl: './supervisors.component.html',
  styleUrl: './supervisors.component.css'
})
export class SupervisorsComponent implements OnInit {
  supervisors: ISupervisorDatabase[] = [];
  assignedSupervisors: ISupervisorDatabase[] = [];
  filteredSupervisors: ISupervisorDatabase[] = [];
  searchControl = new FormControl('');
  displayedColumns: string[] = ['full_name', 'ghana_card_record', 'contact', 'assigned_region', 'assigned_workplace', 'actions'];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // For dual-list assignment
  selectedSupervisorIds: number[] = [];

  constructor(
    private supervisorService: SupervisorService,
    private dialog: MatDialog,
    private nssPersonnelService: NssPersonelService
  ) {}

  ngOnInit() {
    this.loadSupervisors();
    this.loadAssignedSupervisors();
    this.setupSearch();
  }

  loadSupervisors() {
    this.loading = true;
    this.error = null;
    this.supervisorService.getAllSupervisors().subscribe({
      next: (data) => {
        console.log('Loaded supervisors data:', data);
        this.supervisors = data;
        this.filteredSupervisors = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load supervisors:', err);
        this.error = 'Failed to load supervisors.';
        this.loading = false;
      }
    });
  }

  loadAssignedSupervisors() {
    this.supervisorService.getAssignedSupervisors().subscribe({
      next: (data) => {
        this.assignedSupervisors = data;
        // Update selected supervisor IDs to match currently assigned supervisors
        this.selectedSupervisorIds = this.assignedSupervisors.map(s => s.id!).filter(id => id !== undefined);
      },
      error: (err) => {
        console.error('Failed to load assigned supervisors:', err);
        this.assignedSupervisors = [];
      }
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(startWith('')).subscribe(search => {
      const term = (search || '').toLowerCase();
      this.filteredSupervisors = this.supervisors.filter(s =>
        s.full_name.toLowerCase().includes(term) ||
        s.ghana_card_record.toLowerCase().includes(term) ||
        s.contact.toLowerCase().includes(term)
      );
    });
  }

  // Dual-list assignment logic
  toggleSupervisorSelection(id: number) {
    console.log('Toggle supervisor selection:', id);
    console.log('Current selectedSupervisorIds:', this.selectedSupervisorIds);

    if (!id || isNaN(id)) {
      console.error('Invalid supervisor ID:', id);
      return;
    }

    if (this.selectedSupervisorIds.includes(id)) {
      this.selectedSupervisorIds = this.selectedSupervisorIds.filter(sid => sid !== id);
      console.log('Removed supervisor:', id);
    } else {
      this.selectedSupervisorIds.push(id);
      console.log('Added supervisor:', id);
    }

    console.log('Updated selectedSupervisorIds:', this.selectedSupervisorIds);
  }

  saveAssignedSupervisors() {
    if (this.selectedSupervisorIds.length === 0) {
      this.error = 'Please select at least one supervisor to assign.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    console.log('Sending supervisor IDs to backend:', this.selectedSupervisorIds);
    console.log('Selected supervisors:', this.supervisors.filter(s => this.selectedSupervisorIds.includes(s.id!)));

    this.supervisorService.assignSupervisorsToAdmin(this.selectedSupervisorIds).subscribe({
      next: () => {
        this.loading = false;
        this.loadAssignedSupervisors();
        this.successMessage = `Successfully assigned ${this.selectedSupervisorIds.length} supervisor(s) to you!`;

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to assign supervisors:', err);
        this.error = 'Failed to assign supervisors. Please try again.';
      }
    });
  }

  // Add/Edit/Delete Supervisor stubs
  openAddSupervisorDialog() {
    const dialogRef = this.dialog.open(AddSupervisorDialogComponent, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadSupervisors();
      }
    });
  }

  openEditSupervisorDialog(supervisor: ISupervisorDatabase) {
    const dialogRef = this.dialog.open(EditSupervisorDialog, {
      width: '500px',
      data: { supervisor }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadSupervisors();
      }
    });
  }

  deleteSupervisor(supervisor: ISupervisorDatabase) {
    const dialogRef = this.dialog.open(DeleteSupervisorDialog, {
      width: '400px',
      data: { supervisor }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.supervisorService.deleteSupervisor(supervisor.user).subscribe({
          next: () => this.loadSupervisors(),
          error: () => this.error = 'Failed to delete supervisor.'
        });
      }
    });
  }

  // Assign supervisor to NSS personnel stub
  openAssignToPersonnelDialog() {
    this.dialog.open(AssignToPersonnelDialog, {
      width: '400px',
      data: {},
    });
  }
}

@Component({
  selector: 'assign-to-personnel-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatDialogModule, MatSelectModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="assign-personnel-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">
          <i class="fas fa-user-plus"></i>
          Assign Supervisor
        </h2>
        <button class="close-btn" (click)="dialogRef.close()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-link"></i>
            Create Assignment
          </h3>
          <p class="section-description">Assign a supervisor to an NSS personnel member</p>
        </div>

        <div class="assignment-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user-graduate"></i>
              NSS Personnel
            </label>
            <select [(ngModel)]="selectedPersonnelId" class="form-select" [disabled]="loading">
              <option value="">Select NSS Personnel</option>
              <option *ngFor="let p of personnel" [ngValue]="p.id">
                {{ p.full_name }} ({{ p.nss_id }})
              </option>
            </select>
            <div class="field-hint">Choose the NSS personnel member to assign</div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user-tie"></i>
              Supervisor
            </label>
            <select [(ngModel)]="selectedSupervisorId" class="form-select" [disabled]="loading">
              <option value="">Select Supervisor</option>
              <option *ngFor="let s of supervisors" [ngValue]="s.id">
                {{ s.full_name }}
              </option>
            </select>
            <div class="field-hint">Choose the supervisor to assign</div>
          </div>

          <div *ngIf="error" class="message error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>

          <div *ngIf="selectedPersonnelId !== null && selectedSupervisorId !== null" class="assignment-preview">
            <div class="preview-header">
              <i class="fas fa-eye"></i>
              Assignment Preview
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="preview-label">Personnel:</span>
                <span class="preview-value">{{ getPersonnelName(selectedPersonnelId) }}</span>
              </div>
              <div class="preview-item">
                <span class="preview-label">Supervisor:</span>
                <span class="preview-value">{{ getSupervisorName(selectedSupervisorId) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn btn-secondary" (click)="dialogRef.close()" [disabled]="loading">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn btn-primary" (click)="assign()" [disabled]="!selectedPersonnelId || !selectedSupervisorId || loading">
          <i class="fas fa-link"></i>
          {{ loading ? 'Assigning...' : 'Create Assignment' }}
        </button>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading data...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Assign Personnel Dialog - Modern Design */
    .assign-personnel-dialog {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 0;
      max-width: 400px;
      width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      position: relative;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .dialog-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      padding: 25px 30px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: relative;
    }

    .dialog-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }

    .dialog-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dialog-title i {
      font-size: 28px;
      color: #fff;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    /* Content */
    .dialog-content {
      background: white;
      padding: 30px;
    }

    .form-section {
      margin-bottom: 30px;
      text-align: center;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .section-title i {
      color: #4facfe;
      font-size: 24px;
    }

    .section-description {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    /* Form Layout */
    .assignment-form {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-label i {
      color: #4facfe;
      font-size: 16px;
    }

    /* Form Inputs */
    .form-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .form-select:focus {
      outline: none;
      border-color: #4facfe;
      background: white;
      box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
      transform: translateY(-1px);
    }

    .form-select:disabled {
      background: #f5f5f5;
      color: #666;
      cursor: not-allowed;
    }

    .field-hint {
      font-size: 12px;
      color: #666;
      font-style: italic;
      margin-top: 4px;
    }

    /* Messages */
    .message {
      padding: 15px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    .error-message {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    /* Assignment Preview */
    .assignment-preview {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #4facfe;
      border-radius: 12px;
      padding: 20px;
      margin-top: 10px;
      animation: slideIn 0.3s ease;
    }

    .preview-header {
      font-weight: 600;
      color: #4facfe;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .preview-item:last-child {
      border-bottom: none;
    }

    .preview-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .preview-value {
      color: #666;
      font-size: 14px;
      text-align: right;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding: 20px 30px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      min-width: 120px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    /* Loading Overlay */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      backdrop-filter: blur(5px);
      z-index: 1000;
    }

    .loading-spinner {
      text-align: center;
      color: #4facfe;
    }

    .loading-spinner i {
      font-size: 40px;
      margin-bottom: 15px;
      animation: spin 1s linear infinite;
    }

    .loading-spinner p {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .assign-personnel-dialog {
        width: 95vw;
        margin: 10px;
      }

      .dialog-header {
        padding: 20px;
      }

      .dialog-title {
        font-size: 20px;
      }

      .dialog-content {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
        padding: 20px;
      }

      .btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .assign-personnel-dialog {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
        margin: 0;
      }

      .dialog-header {
        border-radius: 0;
      }
    }
  `]
})
export class AssignToPersonnelDialog implements OnInit {
  personnel: nss_database[] = [];
  supervisors: ISupervisorDatabase[] = [];
  selectedPersonnelId: number | null = null;
  selectedSupervisorId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private nssPersonnelService: NssPersonelService,
    private supervisorService: SupervisorService,
    public dialogRef: MatDialogRef<AssignToPersonnelDialog>
  ) {}

  ngOnInit() {
    this.loading = true;
    
    // Load unassigned personnel
    this.nssPersonnelService.getUnassignedPersonnel().subscribe({
      next: (data: nss_database[]) => {
        console.log('Unassigned personnel loaded:', data);
        this.personnel = data;
        this.loading = false;
        
        // If no unassigned personnel, show a message
        if (this.personnel.length === 0) {
          console.log('No unassigned personnel found');
          this.error = 'No unassigned NSS personnel found.';
        }
      },
      error: (err: any) => {
        console.error('Error loading unassigned personnel:', err);
        this.error = 'Failed to load NSS personnel. Please try again.';
        this.loading = false;
      }
    });
    
    // Load all supervisors
    this.supervisorService.getAllSupervisors().subscribe({
      next: (data: ISupervisorDatabase[]) => {
        console.log('Supervisors loaded:', data);
        this.supervisors = data;
        
        // If no supervisors, show an error
        if (this.supervisors.length === 0) {
          console.error('No supervisors found');
          this.error = 'No supervisors available. Please add supervisors first.';
        }
      },
      error: (err: any) => {
        console.error('Error loading supervisors:', err);
        this.error = 'Failed to load supervisors. Please try again.';
      }
    });
  }

  getPersonnelName(id: number): string {
    const personnel = this.personnel.find(p => p.id === id);
    return personnel ? `${personnel.full_name} (${personnel.nss_id})` : '';
  }

  getSupervisorName(id: number): string {
    const supervisor = this.supervisors.find(s => s.id === id);
    return supervisor ? supervisor.full_name : '';
  }

  assign() {
    if (!this.selectedPersonnelId || !this.selectedSupervisorId) {
      this.error = 'Please select both NSS personnel and a supervisor.';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    console.log(`Assigning supervisor ${this.selectedSupervisorId} to NSS personnel ${this.selectedPersonnelId}`);
    
    this.supervisorService.assignSupervisorToPersonnel(this.selectedPersonnelId, this.selectedSupervisorId).subscribe({
      next: (response) => {
        console.log('Assignment successful:', response);
        this.loading = false;
        // Close the dialog and pass true to indicate success
        this.dialogRef.close({ 
          success: true, 
          personnelId: this.selectedPersonnelId,
          supervisorId: this.selectedSupervisorId
        });
      },
      error: (err: any) => {
        console.error('Error assigning supervisor:', err);
        this.loading = false;
        
        // Provide more specific error messages based on the error status
        if (err.status === 404) {
          this.error = 'Personnel or supervisor not found. Please refresh and try again.';
        } else if (err.status === 400) {
          this.error = 'Invalid request. Please check your input and try again.';
        } else if (err.status === 403) {
          this.error = 'You do not have permission to perform this action.';
        } else {
          this.error = 'Failed to assign supervisor. Please try again later.';
        }
      }
    });
  }
}

@Component({
  selector: 'delete-supervisor-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="delete-supervisor-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">
          <i class="fas fa-exclamation-triangle"></i>
          Confirm Deletion
        </h2>
        <button class="close-btn" (click)="dialogRef.close('cancel')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <div class="warning-section">
          <div class="warning-icon">
            <i class="fas fa-trash-alt"></i>
          </div>
          <h3 class="warning-title">Delete Supervisor</h3>
          <p class="warning-description">
            Are you sure you want to permanently delete the supervisor
            <strong>{{ data.supervisor.full_name }}</strong>?
          </p>
          <div class="supervisor-info">
            <div class="info-item">
              <i class="fas fa-id-card"></i>
              <span>{{ data.supervisor.ghana_card_record }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-phone"></i>
              <span>{{ data.supervisor.contact }}</span>
            </div>
            <div class="info-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ data.supervisor.region_of_posting }}</span>
            </div>
          </div>
          <div class="warning-note">
            <i class="fas fa-info-circle"></i>
            <span>This action cannot be undone. All associated data will be permanently removed.</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn btn-secondary" (click)="dialogRef.close('cancel')">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn btn-danger" (click)="dialogRef.close('confirm')">
          <i class="fas fa-trash-alt"></i>
          Delete Supervisor
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Delete Supervisor Dialog - Modern Design */
    .delete-supervisor-dialog {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 0;
      max-width: 400px;
      width: 95vw;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      position: relative;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .dialog-header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      padding: 25px 30px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: relative;
    }

    .dialog-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }

    .dialog-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dialog-title i {
      font-size: 28px;
      color: #fff;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    /* Content */
    .dialog-content {
      background: white;
      padding: 30px;
    }

    .warning-section {
      text-align: center;
    }

    .warning-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
    }

    .warning-icon i {
      font-size: 36px;
      color: white;
    }

    .warning-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin: 0 0 15px 0;
    }

    .warning-description {
      color: #666;
      font-size: 16px;
      line-height: 1.5;
      margin: 0 0 25px 0;
    }

    .warning-description strong {
      color: #333;
      font-weight: 600;
    }

    .supervisor-info {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: left;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      color: #333;
      font-size: 14px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item i {
      color: #4facfe;
      font-size: 16px;
      width: 20px;
    }

    .warning-note {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border: 1px solid #ffeaa7;
      border-radius: 12px;
      padding: 15px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 20px;
    }

    .warning-note i {
      color: #856404;
      font-size: 18px;
      margin-top: 2px;
    }

    .warning-note span {
      color: #856404;
      font-size: 14px;
      line-height: 1.4;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      padding: 20px 30px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      min-width: 120px;
      justify-content: center;
    }

    .btn-secondary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    .btn-danger:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .delete-supervisor-dialog {
        width: 95vw;
        margin: 10px;
      }

      .dialog-header {
        padding: 20px;
      }

      .dialog-title {
        font-size: 20px;
      }

      .dialog-content {
        padding: 20px;
      }

      .warning-icon {
        width: 60px;
        height: 60px;
      }

      .warning-icon i {
        font-size: 28px;
      }

      .form-actions {
        flex-direction: column;
        padding: 20px;
      }

      .btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .delete-supervisor-dialog {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
        margin: 0;
      }

      .dialog-header {
        border-radius: 0;
      }
    }
  `]
})
export class DeleteSupervisorDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteSupervisorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { supervisor: ISupervisorDatabase }
  ) {}

  ngOnInit() {}
}

@Component({
  selector: 'edit-supervisor-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatSelectModule, FormsModule],
  template: `
    <div class="edit-supervisor-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">
          <i class="fas fa-edit"></i>
          Edit Supervisor
        </h2>
        <button class="close-btn" (click)="dialogRef.close()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <div class="form-section">
          <h3 class="section-title">
            <i class="fas fa-user-tie"></i>
            Supervisor Information
          </h3>
          <p class="section-description">Update the supervisor's assigned region</p>
        </div>

        <div class="edit-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i>
                Full Name
              </label>
              <input [value]="data.supervisor.full_name" readonly class="form-input readonly">
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-id-card"></i>
                Ghana Card Record
              </label>
              <input [value]="data.supervisor.ghana_card_record" readonly class="form-input readonly">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-phone"></i>
                Contact Number
              </label>
              <input [value]="data.supervisor.contact" readonly class="form-input readonly">
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-building"></i>
                Workplace
              </label>
              <input [value]="data.supervisor.assigned_workplace" readonly class="form-input readonly">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-map-marker-alt"></i>
              Assigned Region
            </label>
            <select [(ngModel)]="selectedRegion" required [disabled]="loading" class="form-select">
              <option value="">Select Region</option>
              <option *ngFor="let region of regions" [value]="region.id">{{ region.name }}</option>
            </select>
            <div class="field-hint">This is the only field that can be modified</div>
          </div>

          <div *ngIf="error" class="message error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn btn-secondary" (click)="dialogRef.close()" [disabled]="loading">
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn btn-primary" (click)="saveChanges()" [disabled]="!selectedRegion || loading">
          <i class="fas fa-save"></i>
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Loading Overlay -->
      <div *ngIf="loading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Saving changes...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Edit Supervisor Dialog - Modern Design */
    .edit-supervisor-dialog {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 0;
      max-width: 500px;
      width: 95vw;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      position: relative;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Header */
    .dialog-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      padding: 25px 30px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: relative;
    }

    .dialog-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }

    .dialog-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dialog-title i {
      font-size: 28px;
      color: #fff;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    /* Content */
    .dialog-content {
      background: white;
      padding: 30px;
    }

    .form-section {
      margin-bottom: 30px;
      text-align: center;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .section-title i {
      color: #4facfe;
      font-size: 24px;
    }

    .section-description {
      color: #666;
      font-size: 14px;
      margin: 0;
    }

    /* Form Layout */
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-label i {
      color: #4facfe;
      font-size: 16px;
    }

    /* Form Inputs */
    .form-input,
    .form-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #4facfe;
      background: white;
      box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
      transform: translateY(-1px);
    }

    .form-input.readonly {
      background: #f5f5f5;
      color: #666;
      cursor: not-allowed;
      border-color: #ddd;
    }

    .form-input.readonly:focus {
      border-color: #ddd;
      box-shadow: none;
      transform: none;
    }

    .field-hint {
      font-size: 12px;
      color: #666;
      font-style: italic;
      margin-top: 4px;
    }

    /* Messages */
    .message {
      padding: 15px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    .error-message {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding: 20px 30px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      min-width: 120px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    /* Loading Overlay */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      backdrop-filter: blur(5px);
      z-index: 1000;
    }

    .loading-spinner {
      text-align: center;
      color: #4facfe;
    }

    .loading-spinner i {
      font-size: 40px;
      margin-bottom: 15px;
      animation: spin 1s linear infinite;
    }

    .loading-spinner p {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    /* Animations */
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .edit-supervisor-dialog {
        width: 95vw;
        margin: 10px;
      }

      .dialog-header {
        padding: 20px;
      }

      .dialog-title {
        font-size: 20px;
      }

      .dialog-content {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .form-actions {
        flex-direction: column;
        padding: 20px;
      }

      .btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .edit-supervisor-dialog {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
        margin: 0;
      }

      .dialog-header {
        border-radius: 0;
      }
         }
   `]
})
export class EditSupervisorDialog implements OnInit {
  regions: any[] = [];
  selectedRegion: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditSupervisorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { supervisor: ISupervisorDatabase },
    private http: HttpClient,
    private supervisorService: SupervisorService
  ) {}

  ngOnInit() {
    this.loadRegions();
  }

  loadRegions() {
    this.http.get<any[]>(`${environment.apiUrl}regions/`).subscribe({
      next: (data) => {
        this.regions = data;
        // Set current region after regions are loaded
        this.selectedRegion = this.findRegionIdByName(this.data.supervisor.region_of_posting);
      },
      error: () => {
        this.regions = [];
        this.error = 'Failed to load regions.';
      }
    });
  }

  findRegionIdByName(regionName: string): number | null {
    const region = this.regions.find(r => r.name === regionName);
    return region ? region.id : null;
  }

  saveChanges() {
    if (!this.selectedRegion) return;

    const selectedRegionName = this.regions.find(r => r.id === this.selectedRegion)?.name;
    if (!selectedRegionName) return;

    this.loading = true;
    this.error = null;

    const updateData = {
      region_of_posting: selectedRegionName
    };

    this.supervisorService.editSupervisor(this.data.supervisor.user, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close('success');
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Failed to update supervisor:', err);
        this.error = 'Failed to update supervisor. Please try again.';
      }
    });
  }
}
