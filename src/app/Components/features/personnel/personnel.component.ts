import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Personnel {
  id: string;
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
  lastActivity: Date;
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}


@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './personnel.component.html',
  styleUrl: './personnel.component.css'
})
export class PersonnelComponent {
  selectedStatus = '';
  selectedDepartment = '';
  selectedPerformance = '';
  searchQuery = '';
  viewMode = signal<'grid' | 'list'>('grid');

  personnel = signal<Personnel[]>([
    {
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
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      performance: 'excellent'
    },
    {
      id: 'P002',
      name: 'Kofi Asante',
      email: 'kofi.asante@nss.gov.gh',
      phone: '+233 24 234 5678',
      region: 'Ashanti',
      department: 'Community Development',
      position: 'Project Coordinator',
      startDate: new Date('2024-02-01'),
      status: 'active',
      totalSubmissions: 12,
      pendingSubmissions: 1,
      approvedSubmissions: 10,
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
      performance: 'good'
    },
    {
      id: 'P003',
      name: 'Ama Osei',
      email: 'ama.osei@nss.gov.gh',
      phone: '+233 24 345 6789',
      region: 'Northern',
      department: 'Health',
      position: 'Health Assistant',
      startDate: new Date('2024-01-20'),
      status: 'active',
      totalSubmissions: 18,
      pendingSubmissions: 3,
      approvedSubmissions: 15,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      performance: 'excellent'
    },
    {
      id: 'P004',
      name: 'Kwame Owusu',
      email: 'kwame.owusu@nss.gov.gh',
      phone: '+233 24 456 7890',
      region: 'Greater Accra',
      department: 'Agriculture',
      position: 'Agricultural Extension Officer',
      startDate: new Date('2024-03-01'),
      status: 'on_leave',
      totalSubmissions: 9,
      pendingSubmissions: 1,
      approvedSubmissions: 7,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      performance: 'satisfactory'
    },
    {
      id: 'P005',
      name: 'Efua Boateng',
      email: 'efua.boateng@nss.gov.gh',
      phone: '+233 24 567 8901',
      region: 'Central',
      department: 'Social Services',
      position: 'Social Worker',
      startDate: new Date('2024-02-15'),
      status: 'active',
      totalSubmissions: 14,
      pendingSubmissions: 2,
      approvedSubmissions: 11,
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000),
      performance: 'good'
    },
    {
      id: 'P006',
      name: 'Yaw Adjei',
      email: 'yaw.adjei@nss.gov.gh',
      phone: '+233 24 678 9012',
      region: 'Western',
      department: 'Infrastructure',
      position: 'Engineering Assistant',
      startDate: new Date('2024-01-10'),
      status: 'active',
      totalSubmissions: 8,
      pendingSubmissions: 4,
      approvedSubmissions: 3,
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
      performance: 'needs_improvement'
    }
  ]);

  filteredPersonnel = computed(() => {
    let filtered = this.personnel();

    if (this.selectedStatus) {
      filtered = filtered.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedDepartment) {
      filtered = filtered.filter(p => p.department === this.selectedDepartment);
    }

    if (this.selectedPerformance) {
      filtered = filtered.filter(p => p.performance === this.selectedPerformance);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
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

  // Computed statistics
  activeCount = computed(() =>
    this.personnel().filter(p => p.status === 'active').length
  );

  excellentPerformers = computed(() =>
    this.personnel().filter(p => p.performance === 'excellent').length
  );

  totalPendingSubmissions = computed(() =>
    this.personnel().reduce((sum, p) => sum + p.pendingSubmissions, 0)
  );

  needsAttentionCount = computed(() =>
    this.personnel().filter(p =>
      p.performance === 'needs_improvement' ||
      p.pendingSubmissions > 3 ||
      (new Date().getTime() - p.lastActivity.getTime()) > (7 * 24 * 60 * 60 * 1000)
    ).length
  );

  applyFilters() {
    // Filters are applied automatically through computed signal
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
