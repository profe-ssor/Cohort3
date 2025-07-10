import { CommonModule } from '@angular/common';
import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { PDF } from '../../../model/interface/pdf';

interface Personnel {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  department: string;
  position: string;
  startDate: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'completed';
  avatar?: string;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  lastActivity: Date | null;
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}


@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './personnel.component.html',
  styleUrl: './personnel.component.css'
})
export class PersonnelComponent implements OnInit {
  selectedStatus = signal<string>('');
  selectedDepartment = signal<string>('');
  selectedPerformance = signal<string>('');
  searchQuery = signal<string>('');
  viewMode = signal<'grid' | 'list'>('grid');

  personnel = signal<Personnel[]>([]);

  filteredPersonnel = computed(() => {
    let filtered = this.personnel();

    if (this.selectedStatus()) {
      filtered = filtered.filter(p => p.status === this.selectedStatus());
    }

    if (this.selectedDepartment()) {
      filtered = filtered.filter(p => p.department === this.selectedDepartment());
    }

    if (this.selectedPerformance()) {
      filtered = filtered.filter(p => p.performance === this.selectedPerformance());
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        (p.department || '').toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // Sort by performance first (excellent -> good -> satisfactory -> needs_improvement)
      const performanceOrder = { excellent: 0, good: 1, satisfactory: 2, needs_improvement: 3 };
      if (a.performance !== b.performance) {
        return performanceOrder[a.performance] - performanceOrder[b.performance];
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  });

  // Backend-driven counts
  activeCount = 0;
  excellentPerformers = 0;
  needsAttentionCount = 0;
  totalPendingSubmissions = 0;

  evaluationForms: PDF[] = [];

  departments: { value: string, label: string }[] = [];
  performances: { value: string, label: string }[] = [];

  constructor(
    private nssPersonnelService: NssPersonelService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.loadCounts();
    this.fetchPersonnel();
    this.nssPersonnelService.getDepartments().subscribe(depts => this.departments = depts);
    this.nssPersonnelService.getPerformanceChoices().subscribe(perfs => this.performances = perfs);
  }

  loadCounts() {
    this.nssPersonnelService.getStatusCountsForSupervisor().subscribe(data => {
      const active = data.find((d: any) => d.status === 'active');
      this.activeCount = active ? active.total : 0;
    });

    this.nssPersonnelService.getPerformanceCountsForSupervisor().subscribe(data => {
      const excellent = data.find((d: any) => d.performance === 'excellent');
      const needsAttention = data.find((d: any) => d.performance === 'needs_improvement');
      this.excellentPerformers = excellent ? excellent.total : 0;
      this.needsAttentionCount = needsAttention ? needsAttention.total : 0;
    });

    // Use dashboard_stats endpoint for Pending Submissions
    this.evaluationService.getDashboardStats().subscribe(stats => {
      this.totalPendingSubmissions = stats.total_pending || 0;
    }, () => {
      this.totalPendingSubmissions = 0;
    });
  }

  fetchPersonnel() {
    this.nssPersonnelService.getAssignedPersonnel().subscribe((data: any[]) => {
      // Map backend data to Personnel interface as needed
      const personnelList = data.map(p => ({
        id: p.id || p.nss_id,
        user_id: p.user?.id || p.user_id || p.email || '',
        name: p.full_name,
        email: p.user?.email || p.email || '',
        phone: p.phone,
        region: p.region_name || '',
        department: p.department, // use raw backend value
        position: p.assigned_institution || '',
        startDate: new Date(p.start_date),
        status: p.status,
        totalSubmissions: 0,
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        lastActivity: null as Date | null,
        performance: p.performance // use raw backend value
      }));
      // Fetch stats and map to personnel
      this.evaluationService.getPersonnelSubmissions().subscribe(statsArr => {
        personnelList.forEach(person => {
          const stat = statsArr.find(s => String(s.personnelId) === String(person.user_id));
          if (stat) {
            person.totalSubmissions = stat.submissions || 0;
            person.pendingSubmissions = stat.pending || 0;
            person.approvedSubmissions = stat.approved || 0;
            person.lastActivity = stat.lastActivity ? new Date(stat.lastActivity) : null;
          }
        });
        this.personnel.set([...personnelList]);
      });
      this.applyFilters();
    });
  }

  applyFilters() {
    // No-op: signals trigger recompute automatically
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'success',
      inactive: 'secondary',
      on_leave: 'warning',
      completed: 'info'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      on_leave: 'On Leave',
      completed: 'Completed'
    };
    return statusMap[status] || status;
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

  contactPersonnel(person: Personnel) {
    console.log('Contacting personnel:', person.name);
    // Open message interface
  }
}
