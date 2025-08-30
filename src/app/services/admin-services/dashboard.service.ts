import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, map, catchError, tap } from 'rxjs';
import { ActivityLog, ActivitySeverity, DashboardStats, PersonnelData, PersonnelStatus, RegionalData, SubmissionData, SubmissionStatus, SupervisorData, SupervisorStatus } from '../../model/interface/dashboard.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private statsSubject = new BehaviorSubject<DashboardStats>({
    totalSubmissions: 0,
    pendingReviews: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalPersonnel: 0,
    activeSupervisors: 0
  });

  private activityRefreshSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Unauthorized');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    const url = `${environment.apiUrl}evaluations/admin/dashboard/stats/`;
    console.log('🔍 DEBUG: DashboardService calling admin dashboard stats API:', url);

    return this.http.get<DashboardStats>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        console.log('🔍 DEBUG: DashboardService admin dashboard stats response:', response);
      })
    );
  }

  getRecentSubmissions(limit: number = 10): Observable<SubmissionData[]> {
    return this.http.get<SubmissionData[]>(`${environment.apiUrl}evaluations/admin/evaluations/?page=1&page_size=${limit}`);
  }

  getPersonnelData(page: number = 1, limit: number = 10): Observable<{data: PersonnelData[], total: number}> {
    return this.http.get<{data: PersonnelData[], total: number}>(`${environment.apiUrl}admin/personnel/?page=${page}&page_size=${limit}`);
  }

  getSupervisors(): Observable<SupervisorData[]> {
    return this.http.get<SupervisorData[]>(`${environment.apiUrl}admin/supervisors/`);
  }

  getRecentActivity(limit: number = 15): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${environment.apiUrl}evaluations/admin/activity/?limit=${limit}`);
  }

  getRegionalData(): Observable<RegionalData[]> {
    return this.http.get<RegionalData[]>(`${environment.apiUrl}dashboard/region-data/`);
  }

  updateSubmissionStatus(submissionId: string, status: SubmissionStatus): Observable<boolean> {
    return this.http.patch<boolean>(`${environment.apiUrl}evaluations/admin/evaluations/${submissionId}/update-status/`, { status });
  }

  // Method to refresh activity feed - emits an event that components can listen to
  refreshActivityFeed(): void {
    // No-op or implement if needed
  }

  // Observable to listen for activity feed refresh events
  onActivityFeedRefresh(): Observable<void> {
    // No-op or implement if needed
    return new Observable<void>();
  }
}
