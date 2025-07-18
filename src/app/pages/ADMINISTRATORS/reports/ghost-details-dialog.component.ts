import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ghost-details-dialog',
  standalone: true,
  template: `
    <div class="overlay">
      <div class="overlay-dialog-card details-dialog">
        <button class="close-btn" (click)="onClose()" aria-label="Close dialog">&times;</button>
        <div class="overlay-icon">👻</div>
        <h2 class="overlay-title">Ghost Detection Details</h2>
        <div class="details-list">
          <div class="details-row"><span class="details-label">Personnel:</span> <span>{{ data.nss_personnel_name }}</span></div>
          <div class="details-row"><span class="details-label">Ghana Card:</span> <span>{{ data.personnel_ghana_card }}</span></div>
          <div class="details-row"><span class="details-label">NSS ID:</span> <span>{{ data.personnel_nss_id }}</span></div>
          <div class="details-row"><span class="details-label">Region:</span> <span>{{ data.personnel_region }}</span></div>
          <div class="details-row"><span class="details-label">Department:</span> <span>{{ data.personnel_department }}</span></div>
          <div class="details-row"><span class="details-label">Supervisor:</span> <span>{{ data.supervisor_name }}</span></div>
          <div class="details-row"><span class="details-label">Assigned Admin:</span> <span>{{ data.assigned_admin_name }}</span></div>
          <div class="details-row"><span class="details-label">Severity:</span> <span class="severity-badge" [class]="'severity-' + data.severity">{{ data.severity | titlecase }}</span></div>
          <div class="details-row"><span class="details-label">Status:</span> <span class="status-badge" [class]="'status-' + data.status">{{ data.status | titlecase }}</span></div>
          <div class="details-row"><span class="details-label">Detection Flags:</span> <span><ul class="flags-list"><li *ngFor="let flag of data.detection_flags">{{ flag }}</li></ul></span></div>
          <div class="details-row"><span class="details-label">Timestamp:</span> <span>{{ data.timestamp | date:'medium' }}</span></div>
          <div class="details-row" *ngIf="data.resolved_at"><span class="details-label">Resolved At:</span> <span>{{ data.resolved_at | date:'medium' }}</span></div>
          <div class="details-row" *ngIf="data.admin_action_taken"><span class="details-label">Admin Action:</span> <span>{{ data.admin_action_taken }}</span></div>
          <div class="details-row" *ngIf="data.resolution_notes"><span class="details-label">Resolution Notes:</span> <span>{{ data.resolution_notes }}</span></div>
        </div>
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
    .overlay-dialog-card.details-dialog {
      background: rgba(255,255,255,0.97);
      border-radius: 18px;
      box-shadow: 0 12px 48px 0 rgba(25, 118, 210, 0.18), 0 2px 8px rgba(0,0,0,0.10);
      min-width: 340px;
      max-width: 440px;
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
    .details-list {
      width: 100%;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 1.04em;
      padding: 4px 0;
      border-bottom: 1px solid #f0f2f7;
    }
    .details-label {
      font-weight: 600;
      color: #1976d2;
      min-width: 120px;
      margin-right: 12px;
    }
    .flags-list {
      margin: 0; padding-left: 18px;
      color: #b71c1c;
      font-size: 0.98em;
    }
    .severity-badge {
      background: #e3e9f6;
      color: #1976d2;
      border-radius: 6px;
      padding: 2px 10px;
      font-weight: 600;
      font-size: 0.98em;
    }
    .status-badge {
      background: #f4f7fb;
      color: #333;
      border-radius: 6px;
      padding: 2px 10px;
      font-weight: 600;
      font-size: 0.98em;
    }
    @media (max-width: 480px) {
      .overlay-dialog-card.details-dialog {
        min-width: 0;
        max-width: 98vw;
        padding: 18px 4px 12px 4px;
      }
    }
  `],
  imports: [CommonModule, MatDialogModule]
})
export class GhostDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GhostDetailsDialogComponent>
  ) {}
  onClose() {
    this.dialogRef.close();
  }
}
