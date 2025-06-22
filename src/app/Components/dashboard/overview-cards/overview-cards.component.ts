import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { DashboardStats } from '../../../model/interface/dashboard.models';
import { DashboardService } from '../../../services/admin-services/dashboard.service';


interface StatsCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  progress?: number;
}

@Component({
  selector: 'app-overview-cards',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="overview-grid fade-in">
      @for (card of statsCards; track card.title) {
        <mat-card class="stats-card" [class]="'stats-card-' + card.color">
          <mat-card-content class="stats-content">
            <div class="stats-header">
              <div class="stats-icon-container" [class]="'icon-' + card.color">
                <mat-icon class="stats-icon">{{ card.icon }}</mat-icon>
              </div>

              @if (card.trend) {
                <div class="stats-trend" [class]="'trend-' + card.trend.direction">
                  <mat-icon class="trend-icon">
                    {{ card.trend.direction === 'up' ? 'trending_up' : 'trending_down' }}
                  </mat-icon>
                  <span class="trend-value">{{ card.trend.value }}%</span>
                </div>
              }
            </div>

            <div class="stats-main">
              <div class="stats-value">
                {{ formatNumber(card.value) }}
              </div>
              <div class="stats-title">{{ card.title }}</div>
            </div>

            @if (card.progress !== undefined) {
              <div class="stats-progress">
                <mat-progress-bar
                  mode="determinate"
                  [value]="card.progress"
                  [class]="'progress-' + card.color">
                </mat-progress-bar>
                <span class="progress-label">{{ card.progress }}% completion</span>
              </div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .stats-card {
      background: var(--pure-white);
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-gray);
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .stats-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stats-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
    }

    .stats-card-green::before {
      background: linear-gradient(135deg, var(--status-green), var(--primary-green));
    }

    .stats-card-blue::before {
      background: linear-gradient(135deg, var(--status-blue), #1976D2);
    }

    .stats-card-orange::before {
      background: linear-gradient(135deg, var(--status-yellow), #F57C00);
    }

    .stats-card-red::before {
      background: linear-gradient(135deg, var(--status-red), #C62828);
    }

    .stats-content {
      padding: var(--spacing-lg) !important;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
    }

    .stats-icon-container {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gray);
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

    .icon-red {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(198, 40, 40, 0.1));
      color: var(--status-red);
    }

    .stats-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stats-trend {
      display: flex;
      align-items: center;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      font-weight: 500;
    }

    .trend-up {
      background-color: rgba(76, 175, 80, 0.1);
      color: var(--status-green);
    }

    .trend-down {
      background-color: rgba(244, 67, 54, 0.1);
      color: var(--status-red);
    }

    .trend-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: var(--spacing-xs);
    }

    .stats-main {
      margin-bottom: var(--spacing-md);
    }

    .stats-value {
      font-size: var(--font-size-xxl);
      font-weight: 700;
      color: var(--soft-black);
      line-height: 1.2;
      margin-bottom: var(--spacing-xs);
    }

    .stats-title {
      font-size: var(--font-size-md);
      color: var(--dark-gray);
      font-weight: 500;
    }

    .stats-progress {
      margin-top: var(--spacing-md);
    }

    .progress-label {
      font-size: var(--font-size-xs);
      color: var(--dark-gray);
      margin-top: var(--spacing-xs);
      display: block;
    }

    .progress-green ::ng-deep .mat-progress-bar-fill::after {
      background-color: var(--status-green);
    }

    .progress-blue ::ng-deep .mat-progress-bar-fill::after {
      background-color: var(--status-blue);
    }

    .progress-orange ::ng-deep .mat-progress-bar-fill::after {
      background-color: var(--status-yellow);
    }

    .progress-red ::ng-deep .mat-progress-bar-fill::after {
      background-color: var(--status-red);
    }

    @media (max-width: 768px) {
      .overview-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .stats-content {
        padding: var(--spacing-md) !important;
      }

      .stats-value {
        font-size: var(--font-size-xl);
      }
    }
  `]
})
export class OverviewCardsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  statsCards: StatsCard[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.dashboardService.getDashboardStats().subscribe(stats => {
      this.statsCards = this.mapStatsToCards(stats);
      this.loading = false;
    });
  }

  private mapStatsToCards(stats: DashboardStats): StatsCard[] {
    return [
      {
        title: 'Total Submissions',
        value: stats.totalSubmissions,
        icon: 'assignment',
        color: 'blue',
        trend: { value: 12, direction: 'up' },
        progress: 85
      },
      {
        title: 'Pending Reviews',
        value: stats.pendingReviews,
        icon: 'pending_actions',
        color: 'orange',
        trend: { value: 5, direction: 'down' }
      },
      {
        title: 'Approved',
        value: stats.approvedSubmissions,
        icon: 'check_circle',
        color: 'green',
        trend: { value: 18, direction: 'up' },
        progress: 92
      },
      {
        title: 'Active Personnel',
        value: stats.totalPersonnel,
        icon: 'groups',
        color: 'blue',
        trend: { value: 3, direction: 'up' }
      },
      {
        title: 'Active Supervisors',
        value: stats.activeSupervisors,
        icon: 'supervisor_account',
        color: 'green',
        progress: 78
      },
      {
        title: 'Rejected Submissions',
        value: stats.rejectedSubmissions,
        icon: 'cancel',
        color: 'red',
        trend: { value: 8, direction: 'down' }
      }
    ];
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}
