import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OverviewCardsComponent } from "../../../Components/dashboard/overview-cards/overview-cards.component";
import { ActivityFeedComponent } from "../../../Components/dashboard/activity-feed/activity-feed.component";


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
            <div class="regional-grid">
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
            <div class="regional-footer">
              <button mat-button color="primary">
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
  `]
})
export class DashboardComponent {
  regionData = [
    { name: 'Greater Accra', total: 1250, active: 1180, pending: 70 },
    { name: 'Ashanti', total: 980, active: 920, pending: 60 },
    { name: 'Western', total: 650, active: 610, pending: 40 },
    { name: 'Central', total: 720, active: 680, pending: 40 },
    { name: 'Eastern', total: 580, active: 550, pending: 30 },
    { name: 'Northern', total: 420, active: 390, pending: 30 }
  ];

  quickActions = [
    {
      id: 'new-personnel',
      title: 'Register Personnel',
      description: 'Add new national service personnel to the system',
      icon: 'person_add',
      color: 'green'
    },
    {
      id: 'review-submissions',
      title: 'Review Submissions',
      description: 'Process pending evaluation submissions',
      icon: 'rate_review',
      color: 'blue'
    },
    {
      id: 'generate-reports',
      title: 'Generate Reports',
      description: 'Create comprehensive service reports',
      icon: 'analytics',
      color: 'orange'
    },
    {
      id: 'manage-supervisors',
      title: 'Manage Supervisors',
      description: 'Handle supervisor assignments and permissions',
      icon: 'supervisor_account',
      color: 'blue'
    }
  ];

  performQuickAction(actionId: string): void {
    console.log(`Performing quick action: ${actionId}`);
    // Implement navigation or action logic here
  }
}
