import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { ActivityLog } from '../../../model/interface/dashboard.models';
import { DashboardService } from '../../../services/admin-services/dashboard.service';


@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="activity-card fade-in">
      <mat-card-header class="activity-header">
        <mat-card-title class="activity-title">
          <mat-icon class="title-icon">timeline</mat-icon>
          Recent Activity
        </mat-card-title>
        <div class="header-actions">
          <button mat-button class="view-all-btn">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
      </mat-card-header>

      <mat-card-content class="activity-content">
        @if (loading) {
          <div class="loading-state">
            @for (item of [1,2,3,4,5]; track item) {
              <div class="activity-item-skeleton loading-shimmer"></div>
            }
          </div>
        } @else {
          <div class="activity-list">
            @for (activity of activities; track activity.id) {
              <div class="activity-item slide-in-left">
                <div class="activity-timeline">
                  <div class="timeline-dot" [class]="'severity-' + activity.severity">
                    <mat-icon class="timeline-icon">{{ getActivityIcon(activity.action) }}</mat-icon>
                  </div>
                  @if (!$last) {
                    <div class="timeline-line"></div>
                  }
                </div>

                <div class="activity-details">
                  <div class="activity-main">
                    <div class="activity-description">
                      <strong>{{ activity.performedBy }}</strong> {{ activity.action.toLowerCase() }}
                      @if (activity.relatedId) {
                        <span class="activity-id">#{{ activity.relatedId }}</span>
                      }
                    </div>
                    <div class="activity-meta">
                      <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                      <mat-chip class="severity-chip" [class]="'chip-' + activity.severity">
                        {{ activity.severity?.toUpperCase() }}
                      </mat-chip>
                    </div>
                  </div>

                  @if (activity.description !== activity.action) {
                    <div class="activity-extra">
                      {{ activity.description }}
                    </div>
                  }
                </div>
              </div>

              @if (!$last) {
                <mat-divider class="activity-divider"></mat-divider>
              }
            }
          </div>

          <div class="activity-footer">
            <button mat-stroked-button class="load-more-btn" (click)="loadMoreActivities()">
              <mat-icon>refresh</mat-icon>
              Load More Activities
            </button>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .activity-card {
      background: var(--pure-white);
      border-radius: var(--radius-lg) !important;
      box-shadow: var(--shadow-md);
      height: 600px;
      display: flex;
      flex-direction: column;
    }

    .activity-header {
      padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg) !important;
      border-bottom: 1px solid var(--border-gray);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-title {
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

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .view-all-btn {
      color: var(--primary-green) !important;
      font-weight: 500 !important;
    }

    .activity-content {
      flex: 1;
      padding: 0 !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .loading-state {
      padding: var(--spacing-lg);
    }

    .activity-item-skeleton {
      height: 60px;
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
    }

    .activity-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
    }

    .activity-item {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      position: relative;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .timeline-dot {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--pure-white);
      border: 3px solid var(--border-gray);
      z-index: 2;
    }

    .severity-low {
      border-color: var(--status-blue);
      background-color: rgba(33, 150, 243, 0.1);
    }

    .severity-medium {
      border-color: var(--status-yellow);
      background-color: rgba(255, 152, 0, 0.1);
    }

    .severity-high {
      border-color: var(--status-red);
      background-color: rgba(244, 67, 54, 0.1);
    }

    .severity-critical {
      border-color: var(--status-red);
      background: linear-gradient(135deg, var(--status-red), #C62828);
    }

    .severity-critical .timeline-icon {
      color: var(--pure-white);
    }

    .timeline-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .timeline-line {
      width: 2px;
      height: 40px;
      background: var(--border-gray);
      margin-top: var(--spacing-xs);
    }

    .activity-details {
      flex: 1;
      min-width: 0;
    }

    .activity-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xs);
    }

    .activity-description {
      flex: 1;
      font-size: var(--font-size-sm);
      color: var(--soft-black);
      line-height: 1.4;
    }

    .activity-id {
      color: var(--primary-green);
      font-weight: 500;
      font-family: monospace;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-shrink: 0;
    }

    .activity-time {
      font-size: var(--font-size-xs);
      color: var(--dark-gray);
      white-space: nowrap;
    }

    .severity-chip {
      font-size: 10px !important;
      height: 20px !important;
      padding: 0 6px !important;
      font-weight: 500 !important;
    }

    .chip-low {
      background-color: rgba(33, 150, 243, 0.1) !important;
      color: var(--status-blue) !important;
    }

    .chip-medium {
      background-color: rgba(255, 152, 0, 0.1) !important;
      color: var(--status-yellow) !important;
    }

    .chip-high {
      background-color: rgba(244, 67, 54, 0.1) !important;
      color: var(--status-red) !important;
    }

    .chip-critical {
      background-color: var(--status-red) !important;
      color: var(--pure-white) !important;
    }

    .activity-extra {
      font-size: var(--font-size-xs);
      color: var(--dark-gray);
      margin-top: var(--spacing-xs);
      padding: var(--spacing-sm);
      background-color: var(--primary-gray);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--primary-green);
    }

    .activity-divider {
      margin: var(--spacing-md) 0;
      background-color: var(--border-gray);
    }

    .activity-footer {
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--border-gray);
      text-align: center;
    }

    .load-more-btn {
      color: var(--primary-green) !important;
      border-color: var(--primary-green) !important;
    }

    /* Custom Scrollbar */
    .activity-list::-webkit-scrollbar {
      width: 4px;
    }

    .activity-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .activity-list::-webkit-scrollbar-thumb {
      background: var(--border-gray);
      border-radius: 2px;
    }

    .activity-list::-webkit-scrollbar-thumb:hover {
      background: var(--dark-gray);
    }

    @media (max-width: 768px) {
      .activity-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }

      .activity-main {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .activity-meta {
        justify-content: flex-start;
      }

      .activity-card {
        height: auto;
        min-height: 400px;
      }
    }
  `]
})
export class ActivityFeedComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  activities: ActivityLog[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadRecentActivity();
  }

  private loadRecentActivity(): void {
    this.dashboardService.getRecentActivity(15).subscribe(activities => {
      this.activities = activities;
      this.loading = false;
    });
  }

  loadMoreActivities(): void {
    this.loading = true;
    // Simulate loading more activities
    setTimeout(() => {
      this.loadRecentActivity();
    }, 1000);
  }

  getActivityIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'Submission approved': 'check_circle',
      'Submission rejected': 'cancel',
      'Personnel registered': 'person_add',
      'Supervisor assigned': 'assignment_ind',
      'Evaluation submitted': 'assignment_turned_in',
      'Document uploaded': 'upload_file',
      'Status updated': 'update',
      'Profile modified': 'edit',
      'Report generated': 'analytics'
    };

    return iconMap[action] || 'info';
  }

  formatTime(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
