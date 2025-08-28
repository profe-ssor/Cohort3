import { CommonModule } from '@angular/common';
import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SupervisorService } from '../../../services/supervisors';
import { EvaluationService } from '../../../services/evaluation.service';
import { SupervisorCount } from '../../../model/interface/supervor';
import { EvaluationDashboardStats } from '../../../model/interface/evaluation';
import { DashboardService } from '../../../services/admin-services/dashboard.service';
import { ActivityFeedService } from '../../../services/activity-feed.service';
import { ToastrService } from 'ngx-toastr';

interface MetricCard {
  title: string;
  value: number;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

interface Activity {
  id: string;
  action: string;
  title: string;
  description: string;
  personnel?: string;
  timestamp: string;
  priority?: string;
}

interface PersonnelSubmission {
  personnelId: string;
  name: string;
  region: string;
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
  lastActivity: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedPeriod = 'month';
  private destroy$ = new Subject<void>();

  // Dashboard metrics with loading states
  metrics = signal<MetricCard[]>([
    {
      title: 'Total Submissions',
      value: 0,
      icon: 'submissions',
      trend: 'stable',
      trendValue: 0,
      color: 'primary',
      loading: true
    },
    {
      title: 'Pending Reviews',
      value: 0,
      icon: 'pending',
      trend: 'stable',
      trendValue: 0,
      color: 'warning',
      loading: true
    },
    {
      title: 'Approved This Month',
      value: 0,
      icon: 'approved',
      trend: 'stable',
      trendValue: 0,
      color: 'success',
      loading: true
    },
    {
      title: 'Assigned Personnel',
      value: 0,
      icon: 'personnel',
      trend: 'stable',
      trendValue: 0,
      color: 'primary',
      loading: true
    }
  ]);

  // Real personnel submissions data
  personnelSubmissions = signal<PersonnelSubmission[]>([]);

  // Recent activities (keeping some mock data for now)
  recentActivities = signal<Activity[]>([]);
  loadingActivities = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private supervisorService: SupervisorService,
    private evaluationService: EvaluationService,
    private dashboardService: DashboardService,
    private activityFeedService: ActivityFeedService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.fetchRecentActivities();

    // Listen for activity feed refresh events from other components
    this.dashboardService.onActivityFeedRefresh()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchRecentActivities();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loadEvaluationStats();
    this.getAssignedPersonnel();
    this.loadPersonnelSubmissions();
  }

  loadEvaluationStats(): void {
    this.evaluationService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: EvaluationDashboardStats) => {
          this.updateMetricsWithEvaluationStats(stats);
        },
        error: (error) => {
          console.error('Failed to load evaluation stats:', error);
          this.setMetricsError();
        }
      });
  }

  getAssignedPersonnel(): void {
    this.supervisorService.getSupervisorCounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SupervisorCount[]) => {
          const currentUser = this.authService.getUser();
          const userId = currentUser?.id ?? currentUser?.supervisor_id ?? currentUser?.user_id;
          const match = data.find(item => item.supervisor_id == userId);
          const assignedPersonnelCount = match?.nss_count ?? data[0]?.nss_count ?? 0;

          this.updateAssignedPersonnelMetric(assignedPersonnelCount);
        },
        error: (error) => {
          console.error('Failed to load assigned personnel count:', error);
          this.updateAssignedPersonnelMetric(0);
        }
      });
  }

  loadPersonnelSubmissions(): void {
    this.evaluationService.getPersonnelSubmissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PersonnelSubmission[]) => {
          // Normalize lastActivity from multiple possible backend fields
          const normalized = (data || []).map((item: any) => {
            const dateRaw = item?.lastActivity
              ?? item?.last_activity
              ?? item?.last_submission
              ?? item?.last_submission_date
              ?? item?.last_submitted_at
              ?? item?.last_reviewed_at
              ?? item?.updated_at
              ?? item?.created_at
              ?? item?.timestamp
              ?? item?.last_evaluation_at;
            let dateVal: Date | null = null;
            if (dateRaw !== undefined && dateRaw !== null) {
              if (typeof dateRaw === 'number') {
                // Could be epoch seconds or ms; assume seconds if it looks small
                dateVal = new Date(dateRaw < 1e12 ? dateRaw * 1000 : dateRaw);
              } else {
                dateVal = new Date(String(dateRaw));
              }
            }
            return {
              ...item,
              lastActivity: dateVal && !isNaN(dateVal.getTime()) ? dateVal : null
            } as PersonnelSubmission;
          });
          this.personnelSubmissions.set(normalized as any);
          // Debug counts to console to help diagnose filtering
          const validDates = (normalized as any[]).filter(i => i.lastActivity instanceof Date && !isNaN(i.lastActivity.getTime())).length;
          console.log('[Dashboard] Personnel submissions loaded:', normalized.length, 'items; with valid dates:', validDates);
        },
        error: (error: any) => {
          console.error('Failed to load personnel submissions:', error);
          this.personnelSubmissions.set([]);
        }
      });
  }

  // Return submissions filtered by the selected period (week, month, quarter)
  getFilteredPersonnelSubmissions(): PersonnelSubmission[] {
    const list = this.personnelSubmissions();
    const now = new Date();
    let cutoff = new Date(0);
    switch (this.selectedPeriod) {
      case 'week':
        cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 3);
        break;
    }
    const withDates = list.filter((item: any) => {
      const ts: any = item?.lastActivity instanceof Date ? item.lastActivity : (item?.lastActivity ? new Date(item.lastActivity) : null);
      return ts && !isNaN((ts as Date).getTime());
    });

    if (withDates.length === 0) {
      console.warn('[Dashboard] No valid lastActivity dates detected in personnel submissions; returning unfiltered list');
      return list;
    }

    return withDates.filter((item: any) => {
      const ts: Date = item.lastActivity as Date;
      return ts >= cutoff;
    });
  }

  updateMetricsWithEvaluationStats(stats: EvaluationDashboardStats): void {
    const currentMetrics = this.metrics();

    // Update metrics with real data from backend
    const updatedMetrics = currentMetrics.map(metric => {
      switch (metric.title) {
        case 'Total Submissions':
          return { ...metric, value: stats.total_submissions, loading: false };
        case 'Pending Reviews':
          return { ...metric, value: stats.total_pending, loading: false };
        case 'Approved This Month':
          return { ...metric, value: stats.approved, loading: false };
        default:
          return metric;
      }
    });

    this.metrics.set(updatedMetrics);
  }

  updateAssignedPersonnelMetric(count: number): void {
    const currentMetrics = this.metrics();
    const updatedMetrics = currentMetrics.map(metric => {
      if (metric.title === 'Assigned Personnel') {
        return { ...metric, value: count, loading: false };
      }
      return metric;
    });

    this.metrics.set(updatedMetrics);
  }

  setMetricsError(): void {
    const currentMetrics = this.metrics();
    const updatedMetrics = currentMetrics.map(metric => ({
      ...metric,
      value: 0,
      loading: false
    }));

    this.metrics.set(updatedMetrics);
  }

  // Computed values
  pendingSubmissions = computed(() => {
    const pendingMetric = this.metrics().find(m => m.title === 'Pending Reviews');
    return pendingMetric?.value || 0;
  });

  totalPersonnel = computed(() => {
    const personnelMetric = this.metrics().find(m => m.title === 'Assigned Personnel');
    return personnelMetric?.value || 0;
  });

  getIcon(iconName: string): string {
    const icons: Record<string, string> = {
      submissions: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      pending: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      approved: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      personnel: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>`
    };

    return icons[iconName] || '';
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      submission: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
      </svg>`,
      approval: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      message: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>`,
      personnel: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>`
    };

    return icons[type] || '';
  }

  getRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  fetchRecentActivities(): void {
    this.loadingActivities.set(true);
    const user = this.authService.getUser();
    const isAdmin = user && (user.user_type === 'admin' || user.userType === 'admin');

    const source$ = isAdmin
      ? this.dashboardService.getRecentActivity(10)
      : this.activityFeedService.getRecentActivity();

    source$.subscribe({
      next: (activities: any[]) => {
        this.recentActivities.set((activities || []).map((a: any) => ({
          id: a.id,
          action: a.action,
          title: a.title,
          description: a.description,
          personnel: a.personnel,
          timestamp: a.timestamp,
          priority: a.priority,
        })));
        this.loadingActivities.set(false);
        this.toastr.success('Recent activity loaded', 'Success', { timeOut: 1500 });
      },
      error: () => {
        this.recentActivities.set([]);
        this.loadingActivities.set(false);
        this.toastr.error('Failed to load recent activity', 'Error');
      }
    });
  }

  // Method to refresh activities - can be called from other components
  refreshActivities(): void {
    this.fetchRecentActivities();
  }
}
