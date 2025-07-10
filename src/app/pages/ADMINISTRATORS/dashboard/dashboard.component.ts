import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OverviewCardsComponent } from "../../../Components/dashboard/overview-cards/overview-cards.component";
import { ActivityFeedComponent } from "../../../Components/dashboard/activity-feed/activity-feed.component";
import { EvaluationService } from '../../../services/evaluation.service';
import { DashboardService } from '../../../services/admin-services/dashboard.service';
import { DashboardStats } from '../../../model/interface/dashboard.models';
import { RegionalData } from '../../../model/interface/dashboard.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    OverviewCardsComponent,
    ActivityFeedComponent
],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Header -->
      <div class="welcome-section fade-in">
        <div class="welcome-content">
          <h1 class="welcome-title">Welcome to Ghana National Service Dashboard</h1>
          <p class="welcome-subtitle">
            Efficiently manage national service operations, personnel, and submissions with comprehensive administrative tools.
          </p>
        </div>
        <div class="welcome-actions">
          <button mat-flat-button color="primary" class="action-btn">
            <mat-icon>add</mat-icon>
            New Submission
          </button>
          <button mat-stroked-button class="action-btn">
            <mat-icon>analytics</mat-icon>
            Generate Report
          </button>
        </div>
      </div>

      <!-- Admin Evaluation Stats -->
      <!-- Removed Evaluation Points (Your NSS Personnel) card -->

      <!-- Overview Statistics -->
      <app-overview-cards></app-overview-cards>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Regional Overview -->
        <mat-card class="regional-card fade-in">
          <mat-card-header>
            <mat-card-title class="section-title">
              <mat-icon class="title-icon">map</mat-icon>
              Regional Overview
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="loadingRegions" class="regional-loading">Loading regional data...</div>
            <div *ngIf="errorRegions" class="regional-error">{{ errorRegions }}</div>
            <div class="regional-grid" *ngIf="!loadingRegions && !errorRegions">
              @for (region of regionData; track region.name) {
                <div class="region-item">
                  <div class="region-header">
                    <h4 class="region-name">{{ region.name }}</h4>
                    <span class="region-total">{{ region.total }}</span>
                  </div>
                  <div class="region-stats">
                    <div class="stat-item">
                      <span class="stat-label">Active</span>
                      <span class="stat-value active">{{ region.active }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Pending</span>
                      <span class="stat-value pending">{{ region.pending }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div class="regional-footer" *ngIf="!loadingRegions && !errorRegions && regionData.length">
              <button mat-button color="primary" (click)="viewRegionalDetail('all')">
                View Regional Details
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Activity -->
        <app-activity-feed></app-activity-feed>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section fade-in">
        <h2 class="section-title">
          <mat-icon class="title-icon">flash_on</mat-icon>
          Quick Actions
        </h2>
        <div class="actions-grid">
          @for (action of quickActions; track action.title) {
            <mat-card class="action-card" (click)="performQuickAction(action.id)">
              <mat-card-content class="action-content">
                <div class="action-icon-container" [class]="'icon-' + action.color">
                  <mat-icon class="action-icon">{{ action.icon }}</mat-icon>
                </div>
                <h3 class="action-title">{{ action.title }}</h3>
                <p class="action-description">{{ action.description }}</p>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: var(--spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-xl);
      background: var(--gradient-primary);
      border-radius: var(--radius-lg);
      color: var(--pure-white);
    }

    .welcome-content {
      flex: 1;
    }

    .welcome-title {
      font-size: var(--font-size-xxl);
      font-weight: 600;
      margin: 0 0 var(--spacing-sm) 0;
    }

    .welcome-subtitle {
      font-size: var(--font-size-md);
      opacity: 0.9;
      margin: 0;
      line-height: 1.5;
    }

    .welcome-actions {
      display: flex;
      gap: var(--spacing-md);
      flex-shrink: 0;
    }

    .action-btn {
      border-radius: var(--radius-md) !important;
      font-weight: 500 !important;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .regional-card {
      background: var(--pure-white);
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-md);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-lg) !important;
      font-weight: 600 !important;
      color: var(--soft-black) !important;
      margin: 0 !important;
    }

    .title-icon {
      color: var(--primary-green);
      font-size: 24px;
    }

    .regional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin: var(--spacing-lg) 0;
    }

    .region-item {
      padding: var(--spacing-md);
      border: 1px solid var(--border-gray);
      border-radius: var(--radius-md);
      background: var(--primary-gray);
    }

    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
    }

    .region-name {
      font-size: var(--font-size-md);
      font-weight: 500;
      margin: 0;
      color: var(--soft-black);
    }

    .region-total {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--primary-green);
    }

    .region-stats {
      display: flex;
      gap: var(--spacing-md);
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--dark-gray);
      text-transform: uppercase;
      font-weight: 500;
    }

    .stat-value {
      font-size: var(--font-size-md);
      font-weight: 600;
      margin-top: var(--spacing-xs);
    }

    .stat-value.active {
      color: var(--status-green);
    }

    .stat-value.pending {
      color: var(--status-yellow);
    }

    .regional-footer {
      text-align: center;
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-gray);
    }

    .quick-actions-section {
      margin-top: var(--spacing-xl);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-top: var(--spacing-lg);
    }

    .action-card {
      background: var(--pure-white);
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .action-content {
      text-align: center;
      padding: var(--spacing-xl) !important;
    }

    .action-icon-container {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-md);
    }

    .icon-green {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(0, 128, 0, 0.1));
      color: var(--status-green);
    }

    .icon-blue {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(25, 118, 210, 0.1));
      color: var(--status-blue);
    }

    .icon-orange {
      background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(245, 124, 0, 0.1));
      color: var(--status-yellow);
    }

    .action-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .action-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--soft-black);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .action-description {
      font-size: var(--font-size-sm);
      color: var(--dark-gray);
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: var(--spacing-md);
      }

      .welcome-section {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-lg);
      }

      .welcome-title {
        font-size: var(--font-size-xl);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .regional-grid {
        grid-template-columns: 1fr;
      }
    }

    .admin-eval-stats { margin-bottom: 24px; }
    .admin-eval-stats.error { color: #c62828; }
    .stats-grid { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 12px; }
    .stats-grid > div { min-width: 180px; font-size: 16px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loadingStats = false;
  errorStats: string | null = null;
  regionData: { name: string; total: number; active: number; pending: number }[] = [];
  loadingRegions = false;
  errorRegions: string | null = null;

  quickActions = [
    {
      id: 'personnel',
      title: 'Manage Personnel',
      description: 'View and manage NSS personnel records',
      icon: 'people',
      color: 'primary',
      route: '/admin-dashboard/personnel'
    },
    {
      id: 'supervisors',
      title: 'Manage Supervisors',
      description: 'Assign and manage supervisors',
      icon: 'supervisor_account',
      color: 'accent',
      route: '/admin-dashboard/supervisors'
    },
    {
      id: 'evaluations',
      title: 'View Evaluations',
      description: 'Monitor evaluation submissions',
      icon: 'assessment',
      color: 'warn',
      route: '/admin-dashboard/evaluations'
    },
    {
      id: 'reports',
      title: 'Ghost Detection',
      description: 'Monitor and manage ghost personnel alerts',
      icon: 'security',
      color: 'error',
      route: '/admin-dashboard/reports'
    }
  ];

  constructor(private evaluationService: EvaluationService, private dashboardService: DashboardService, private router: Router) {}

  ngOnInit() {
    this.loadingStats = true;
    this.evaluationService.getAdminDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loadingStats = false;
      },
      error: (err) => {
        this.errorStats = 'Failed to load evaluation stats.';
        this.loadingStats = false;
      }
    });
    // Fetch regional data dynamically
    this.loadingRegions = true;
    this.dashboardService.getRegionalData().subscribe({
      next: (regions: any[]) => {
        this.regionData = regions.map(region => ({
          name: region.region,
          total: region.total_personnel,
          active: region.completed_submissions,
          pending: region.pending_submissions
        }));
        this.loadingRegions = false;
      },
      error: (err) => {
        this.errorRegions = 'Failed to load regional data.';
        this.loadingRegions = false;
      }
    });
  }

  performQuickAction(actionId: string): void {
    const action = this.quickActions.find(a => a.id === actionId);
    if (action && action.route) {
      this.router.navigate([action.route]);
    }
  }

  viewRegionalDetail(regionName: string) {
    this.router.navigate(['/admin/regional-detail', regionName]);
  }
}
