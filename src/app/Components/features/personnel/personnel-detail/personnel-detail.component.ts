import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NssPersonelService } from '../../../../services/nss_personel.service';

interface PersonnelDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  department: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'completed';
  avatar?: string;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  lastActivity: Date;
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  supervisor: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    region: string;
  };
  education: {
    institution: string;
    degree: string;
    year: number;
  };
}

interface Submission {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'project';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedDate: Date;
  reviewedDate?: Date;
  feedback?: string;
  rating?: number;
}

interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'message' | 'update';
  title: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-personnel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe],
  templateUrl: './personnel-detail.component.html',
  styleUrl: './personnel-detail.component.css'
})
export class PersonnelDetailComponent implements OnInit {
  personnelId = signal<string>('');
  personnel = signal<PersonnelDetail | null>(null);
  performances: { value: string, label: string }[] = [];
  isAdmin = true; // TODO: Replace with real admin check

  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Mock data - in real app, this would come from a service
  mockPersonnelData: PersonnelDetail = {
    id: 'P001',
    name: 'Akua Mensah',
    email: 'akua.mensah@nss.gov.gh',
    phone: '+233 24 123 4567',
    region: 'Greater Accra',
    department: 'Education',
    position: 'Teaching Assistant',
    startDate: new Date('2024-01-15'),
    status: 'active',
    totalSubmissions: 15,
    pendingSubmissions: 2,
    approvedSubmissions: 12,
    rejectedSubmissions: 1,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    performance: 'excellent',
    supervisor: 'Kwame Asante',
    emergencyContact: {
      name: 'Mary Mensah',
      relationship: 'Mother',
      phone: '+233 24 987 6543'
    },
    address: {
      street: '123 Liberation Road',
      city: 'Accra',
      region: 'Greater Accra'
    },
    education: {
      institution: 'University of Ghana',
      degree: 'Bachelor of Education',
      year: 2023
    }
  };

  recentSubmissions = signal<any[]>([]);

  recentActivities = signal<Activity[]>([
    {
      id: 'A001',
      type: 'submission',
      title: 'New evaluation submitted',
      description: 'Monthly Performance Evaluation - November 2024',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'A002',
      type: 'approval',
      title: 'Evaluation approved',
      description: 'Quarterly Assessment - Q3 2024',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'A003',
      type: 'message',
      title: 'Message from supervisor',
      description: 'Feedback on recent project submission',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ]);

  constructor(private route: ActivatedRoute, private nssPersonnelService: NssPersonelService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.personnelId.set(params['id']);
      this.loading.set(true);
      this.error.set(null);
      this.nssPersonnelService.getPersonnelDetail(params['id']).subscribe({
        next: (data) => {
          // Map backend fields to frontend interface with fallbacks
          this.personnel.set({
            id: data.id,
            name: data.full_name || data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            region: data.region_name || data.region || '',
            department: data.department || '',
            position: data.assigned_institution || data.position || '',
            startDate: data.start_date ? new Date(data.start_date) : new Date(),
            endDate: data.end_date ? new Date(data.end_date) : undefined,
            status: data.status || 'active',
            avatar: data.avatar || '',
            totalSubmissions: data.total_submissions || 0,
            pendingSubmissions: data.pending_submissions || 0,
            approvedSubmissions: data.approved_submissions || 0,
            rejectedSubmissions: data.rejected_submissions || 0,
            lastActivity: data.last_activity ? new Date(data.last_activity) : new Date(0),
            performance: data.performance || '',
            supervisor: data.supervisor_name || data.supervisor || '',
            emergencyContact: data.emergency_contact || { name: data.full_name || '', relationship: 'Self', phone: data.phone || data.contact || '' },
            address: data.ghana_card_address || '',
            education: data.education || { institution: '', degree: '', year: 0 }
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.personnel.set(null);
          this.error.set('Failed to load personnel details. Please try again.');
          this.loading.set(false);
        }
      });
      // Fetch recent submissions
      this.nssPersonnelService.getRecentSubmissions(params['id']).subscribe({
        next: (data) => this.recentSubmissions.set(data),
        error: () => this.recentSubmissions.set([])
      });
    });
    this.nssPersonnelService.getPerformanceChoices().subscribe((perfs: { value: string, label: string }[]) => this.performances = perfs);
  }

  updatePerformance(newPerformance: string) {
    const person = this.personnel();
    if (!person) return;
    this.nssPersonnelService.updatePersonnelPerformance(person.id, newPerformance)
      .subscribe({
        next: () => {
          person.performance = newPerformance as 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
          // Optionally show a success message
        },
        error: () => {
          // Optionally show an error message
        }
      });
  }

  updateStatus(newStatus: string) {
    const person = this.personnel();
    if (!person) return;
    this.nssPersonnelService.updatePersonnelStatus(person.id, newStatus)
      .subscribe({
        next: () => {
          person.status = newStatus as 'active' | 'inactive' | 'on_leave' | 'completed';
          // Optionally show a success message
        },
        error: () => {
          // Optionally show an error message
        }
      });
  }

  getInitials(name: string | undefined | null): string {
    if (!name || typeof name !== 'string') return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getPerformanceLabel(performance: string): string {
    const performanceMap: Record<string, string> = {
      excellent: 'Excellent',
      good: 'Good',
      satisfactory: 'Satisfactory',
      needs_improvement: 'Needs Improvement'
    };
    return performanceMap[performance] || performance;
  }

  getApprovalRate(): number {
    const personnel = this.personnel();
    if (!personnel || personnel.totalSubmissions === 0) return 0;
    return Math.round((personnel.approvedSubmissions / personnel.totalSubmissions) * 100);
  }

  getServiceDuration(): string {
    const start = this.personnel()?.startDate;
    const end = this.personnel()?.endDate;
    if (!start || !end) return 'N/A';
    const diff = end.getTime() - start.getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    if (years >= 1) return `${Math.round(years)} year${Math.round(years) > 1 ? 's' : ''}`;
    const months = diff / (1000 * 60 * 60 * 24 * 30.44);
    if (months >= 1) return `${Math.round(months)} month${Math.round(months) > 1 ? 's' : ''}`;
    const days = diff / (1000 * 60 * 60 * 24);
    return `${Math.round(days)} day${Math.round(days) > 1 ? 's' : ''}`;
  }

  getRelativeTime(date: Date | undefined): string {
    if (!date) return 'N/A';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) return 'N/A';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'N/A';

      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return 'N/A';
    }
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'danger'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return statusMap[status] || status;
  }

  getTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annual: 'Annual',
      project: 'Project'
    };
    return typeMap[type] || type;
  }

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      submission: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
      </svg>`,
      approval: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      rejection: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>`,
      message: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
      </svg>`,
      update: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>`
    };

    return icons[type] || '';
  }
}
