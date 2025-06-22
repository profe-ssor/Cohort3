import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface MetricCard {
  title: string;
  value: number;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'message' | 'personnel';
  title: string;
  description: string;
  timestamp: Date;
  personnel?: string;
  priority?: 'high' | 'medium' | 'low';
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
export class DashboardComponent {
  selectedPeriod = 'month';

  metrics = signal<MetricCard[]>([
    {
      title: 'Total Submissions',
      value: 156,
      icon: 'submissions',
      trend: 'up',
      trendValue: 12,
      color: 'primary'
    },
    {
      title: 'Pending Reviews',
      value: 23,
      icon: 'pending',
      trend: 'down',
      trendValue: 8,
      color: 'warning'
    },
    {
      title: 'Approved This Month',
      value: 98,
      icon: 'approved',
      trend: 'up',
      trendValue: 15,
      color: 'success'
    },
    {
      title: 'Assigned Personnel',
      value: 24,
      icon: 'personnel',
      trend: 'stable',
      trendValue: 0,
      color: 'primary'
    }
  ]);

  personnelSubmissions = signal<PersonnelSubmission[]>([
    {
      personnelId: '1',
      name: 'Akua Mensah',
      region: 'Accra',
      submissions: 15,
      approved: 12,
      pending: 2,
      rejected: 1,
      lastActivity: new Date()
    },
    {
      personnelId: '2',
      name: 'Kofi Asante',
      region: 'Kumasi',
      submissions: 12,
      approved: 10,
      pending: 1,
      rejected: 1,
      lastActivity: new Date()
    },
    {
      personnelId: '3',
      name: 'Ama Osei',
      region: 'Tamale',
      submissions: 18,
      approved: 15,
      pending: 3,
      rejected: 0,
      lastActivity: new Date()
    },
    {
      personnelId: '4',
      name: 'Kwame Owusu',
      region: 'Accra',
      submissions: 9,
      approved: 7,
      pending: 1,
      rejected: 1,
      lastActivity: new Date()
    },
    {
      personnelId: '5',
      name: 'Efua Boateng',
      region: 'Cape Coast',
      submissions: 14,
      approved: 11,
      pending: 2,
      rejected: 1,
      lastActivity: new Date()
    }
  ]);

  recentActivities = signal<Activity[]>([
    {
      id: '1',
      type: 'submission',
      title: 'New evaluation submitted',
      description: 'Monthly performance evaluation received',
      personnel: 'Akua Mensah',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '2',
      type: 'approval',
      title: 'Evaluation approved',
      description: 'Community development project evaluation',
      personnel: 'Kofi Asante',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: '3',
      type: 'message',
      title: 'Message from administration',
      description: 'New evaluation guidelines available',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '4',
      type: 'personnel',
      title: 'Personnel assignment updated',
      description: 'New service personnel assigned to your supervision',
      personnel: 'Ama Osei',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      priority: 'low'
    },
    {
      id: '5',
      type: 'submission',
      title: 'Evaluation resubmitted',
      description: 'Updated evaluation with requested changes',
      personnel: 'Kwame Owusu',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      priority: 'medium'
    }
  ]);

  // Computed values
  pendingSubmissions = computed(() =>
    this.personnelSubmissions().reduce((sum, p) => sum + p.pending, 0)
  );

  totalPersonnel = computed(() => this.personnelSubmissions().length);

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

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }
}

