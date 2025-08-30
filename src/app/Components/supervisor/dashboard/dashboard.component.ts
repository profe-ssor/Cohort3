import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LogoutResponse } from '../../../model/interface/auth';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { EvaluationDashboardStats } from '../../../model/interface/evaluation';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  logoutMessage: LogoutResponse = { message: ' ' };
  isLoadingCounts = false;
  countError: string | null = null;

  assignedPersonnel: any[] = [];
  activeCount = 0;
  excellentCount = 0;
  needsAttentionCount = 0;
  pendingCount = 0;

  // Evaluation statistics
  evaluationStats: EvaluationDashboardStats = {
    total_submissions: 0,
    total_pending: 0,
    approved: 0,
    overdue: 0,
    under_review: 0,
    completed_today: 0
  };
  isLoadingEvaluationStats = false;
  evaluationStatsError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private nssPersonelService: NssPersonelService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit(): void {
    this.getAssignedPersonnelAndStats();
    this.getEvaluationStats();
    this.getUserName();
  }

  getUserName(): void {
    const fullName = localStorage.getItem('user_full_name');
    this.userName = fullName ? fullName : 'User';
  }

  getAssignedPersonnelAndStats(): void {
    this.isLoadingCounts = true;
    this.nssPersonelService.getAssignedPersonnel().subscribe({
      next: (personnel) => {
        this.assignedPersonnel = personnel;
        this.activeCount = personnel.filter(p => p.status === 'active').length;
        this.excellentCount = personnel.filter(p => p.performance === 'excellent').length;
        this.needsAttentionCount = personnel.filter(p => p.performance === 'needs_attention').length;
        this.pendingCount = personnel.filter(p => p.status === 'pending').length;
      },
      error: (err) => {
        this.countError = 'Failed to load assigned personnel stats';
      },
      complete: () => {
        this.isLoadingCounts = false;
      }
    });
  }

  getEvaluationStats(): void {
    this.isLoadingEvaluationStats = true;
    this.evaluationStatsError = null;

    console.log('Fetching evaluation stats...');
    console.log('API URL:', `${environment.apiUrl}evaluations/dashboard/stats/`);
    console.log('Auth token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');

    this.evaluationService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('✅ Evaluation stats received successfully:', stats);
        this.evaluationStats = stats;
        console.log('Updated evaluationStats object:', this.evaluationStats);
      },
      error: (err) => {
        console.error('❌ Error loading evaluation stats:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.evaluationStatsError = 'Failed to load evaluation statistics';
      },
      complete: () => {
        console.log('✅ Evaluation stats request completed');
        this.isLoadingEvaluationStats = false;
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res: LogoutResponse) => {
        this.logoutMessage = res;
        this.router.navigate(['/resend-otp']);
      },
      error: (err) => {
        // Handle error
      },
      complete: () => {}
    });
  }
}
