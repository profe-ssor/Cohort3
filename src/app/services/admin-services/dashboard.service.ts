import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, map } from 'rxjs';
import { ActivityLog, ActivitySeverity, DashboardStats, PersonnelData, PersonnelStatus, RegionalData, SubmissionData, SubmissionStatus, SupervisorData, SupervisorStatus } from '../../model/interface/dashboard.models';


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

  constructor() {
    this.loadMockData();
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.statsSubject.asObservable();
  }

  getRecentSubmissions(limit: number = 10): Observable<SubmissionData[]> {
    return of(this.mockSubmissions.slice(0, limit)).pipe(delay(500));
  }

  getPersonnelData(page: number = 1, limit: number = 10): Observable<{data: PersonnelData[], total: number}> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return of({
      data: this.mockPersonnel.slice(startIndex, endIndex),
      total: this.mockPersonnel.length
    }).pipe(delay(700));
  }

  getSupervisors(): Observable<SupervisorData[]> {
    return of(this.mockSupervisors).pipe(delay(600));
  }

  getRecentActivity(limit: number = 15): Observable<ActivityLog[]> {
    return of(this.mockActivity.slice(0, limit)).pipe(delay(400));
  }

  getRegionalData(): Observable<RegionalData[]> {
    return of(this.mockRegionalData).pipe(delay(800));
  }

  updateSubmissionStatus(submissionId: string, status: SubmissionStatus): Observable<boolean> {
    const submission = this.mockSubmissions.find(s => s.id === submissionId);
    if (submission) {
      submission.status = status;
      this.updateStats();
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  private loadMockData(): void {
    this.generateMockData();
    this.updateStats();
  }

  private updateStats(): void {
    const stats: DashboardStats = {
      totalSubmissions: this.mockSubmissions.length,
      pendingReviews: this.mockSubmissions.filter(s => s.status === SubmissionStatus.PENDING).length,
      approvedSubmissions: this.mockSubmissions.filter(s => s.status === SubmissionStatus.APPROVED).length,
      rejectedSubmissions: this.mockSubmissions.filter(s => s.status === SubmissionStatus.REJECTED).length,
      totalPersonnel: this.mockPersonnel.length,
      activeSupervisors: this.mockSupervisors.filter(s => s.status === SupervisorStatus.ACTIVE).length
    };
    this.statsSubject.next(stats);
  }

  // Mock Data Generation
  private mockSubmissions: SubmissionData[] = [];
  private mockPersonnel: PersonnelData[] = [];
  private mockSupervisors: SupervisorData[] = [];
  private mockActivity: ActivityLog[] = [];
  private mockRegionalData: RegionalData[] = [];

  private generateMockData(): void {
    const regions = ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo'];
    const statuses = [SubmissionStatus.PENDING, SubmissionStatus.APPROVED, SubmissionStatus.REJECTED, SubmissionStatus.UNDER_REVIEW];

    // Generate mock submissions
    for (let i = 1; i <= 150; i++) {
      this.mockSubmissions.push({
        id: `SUB-${i.toString().padStart(4, '0')}`,
        personnelName: `Service Person ${i}`,
        personnelId: `NSS-${(2024000 + i).toString()}`,
        supervisorName: `Supervisor ${Math.floor(i / 5) + 1}`,
        submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        evaluationScore: Math.floor(Math.random() * 40) + 60,
        comments: Math.random() > 0.7 ? 'Excellent performance throughout the service period.' : undefined
      });
    }

    // Generate mock personnel
    for (let i = 1; i <= 300; i++) {
      this.mockPersonnel.push({
        id: `NSS-${(2024000 + i).toString()}`,
        name: `Service Person ${i}`,
        email: `person${i}@nss.gov.gh`,
        phoneNumber: `+233${Math.floor(Math.random() * 900000000) + 100000000}`,
        region: regions[Math.floor(Math.random() * regions.length)],
        district: `District ${Math.floor(Math.random() * 5) + 1}`,
        serviceYear: '2024/2025',
        supervisor: `Supervisor ${Math.floor(i / 10) + 1}`,
        status: Math.random() > 0.1 ? PersonnelStatus.ACTIVE : PersonnelStatus.COMPLETED,
        joinDate: new Date(2024, 8, Math.floor(Math.random() * 30) + 1),
        completionDate: Math.random() > 0.8 ? new Date(2025, 7, Math.floor(Math.random() * 30) + 1) : undefined
      });
    }

    // Generate mock supervisors
    for (let i = 1; i <= 45; i++) {
      this.mockSupervisors.push({
        id: `SUP-${i.toString().padStart(3, '0')}`,
        name: `Supervisor ${i}`,
        email: `sup${i}@organization.gov.gh`,
        phoneNumber: `+233${Math.floor(Math.random() * 900000000) + 100000000}`,
        organization: `Government Department ${i}`,
        region: regions[Math.floor(Math.random() * regions.length)],
        personnelCount: Math.floor(Math.random() * 15) + 3,
        status: Math.random() > 0.1 ? SupervisorStatus.ACTIVE : SupervisorStatus.INACTIVE
      });
    }

    // Generate mock activity
    const activities = [
      'Submission approved', 'Submission rejected', 'Personnel registered',
      'Supervisor assigned', 'Evaluation submitted', 'Document uploaded',
      'Status updated', 'Profile modified', 'Report generated'
    ];

    for (let i = 1; i <= 50; i++) {
      this.mockActivity.push({
        id: `ACT-${i.toString().padStart(4, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        action: activities[Math.floor(Math.random() * activities.length)],
        performedBy: `Admin User ${Math.floor(Math.random() * 5) + 1}`,
        description: `Performed ${activities[Math.floor(Math.random() * activities.length)].toLowerCase()} operation`,
        relatedId: Math.random() > 0.5 ? `REL-${Math.floor(Math.random() * 1000)}` : undefined,
        severity: [ActivitySeverity.LOW, ActivitySeverity.MEDIUM, ActivitySeverity.HIGH][Math.floor(Math.random() * 3)]
      });
    }

    // Generate regional data
    this.mockRegionalData = regions.map(region => ({
      region,
      totalPersonnel: Math.floor(Math.random() * 50) + 20,
      pendingSubmissions: Math.floor(Math.random() * 15) + 2,
      completedSubmissions: Math.floor(Math.random() * 80) + 30,
      supervisorCount: Math.floor(Math.random() * 8) + 3
    }));
  }
}
