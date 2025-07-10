import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { NssPersonelService } from '../../../services/nss_personel.service';

@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>NSS Personnel Management</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="loading">Loading personnel...</div>
          <div *ngIf="!loading && personnel.length === 0" class="empty">No personnel found.</div>
          <div class="personnel-grid" *ngIf="!loading && personnel.length > 0">
            <mat-card class="personnel-card" *ngFor="let person of personnel">
              <mat-card-header>
                <mat-card-title>{{ person.full_name }}</mat-card-title>
                <mat-card-subtitle>{{ person.email }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div><strong>Region:</strong> {{ person.region_name || person.region || '-' }}</div>
                <div><strong>Department:</strong> {{ person.department }}</div>
                <div><strong>Status:</strong> {{ person.status }}</div>
                <div><strong>Performance:</strong> {{ person.performance }}</div>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/admin-dashboard/personnel', person.id || person.nss_id]">View Details</a>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: var(--spacing-lg);
    }
    .personnel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .personnel-card {
      min-width: 0;
    }
    .loading, .empty {
      text-align: center;
      color: #888;
      margin: 2rem 0;
    }
  `]
})
export class PersonnelComponent implements OnInit {
  personnel: any[] = [];
  loading = true;

  constructor(private nssPersonnelService: NssPersonelService) {}

  ngOnInit() {
    this.nssPersonnelService.getAssignedPersonnel().subscribe({
      next: (data) => {
        this.personnel = data;
        this.loading = false;
      },
      error: () => {
        this.personnel = [];
        this.loading = false;
      }
    });
  }
}
