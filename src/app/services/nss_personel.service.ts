import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { environment } from "../../environments/environment";
import { ISupervisorDatabase } from "../model/interface/supervisor";
import { IAdminDatabase } from "../model/interface/admin";
import { LoginResponse, nss_database, nss_databaseResponse } from "../model/interface/auth";



@Injectable({
  providedIn: 'root'
})
export class NssPersonelService {

  constructor(
    private http: HttpClient,
    private router: Router,

  ) {

  }






  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
  // nss_database
  nssDatabase(userData: nss_database): Observable<nss_databaseResponse > {
    return this.http.post<nss_databaseResponse>(`${environment.apiUrl}nss_personnel/nssdb/`, userData);
  }
  // get my supervisor
  getMySupervisor(): Observable<ISupervisorDatabase> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be logged in");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ISupervisorDatabase>(`${environment.apiUrl}nss_personnel/my-supervisor/`, { headers });

  }


  getMyAdmin(): Observable<IAdminDatabase> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be logged in");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IAdminDatabase>(`${environment.apiUrl}nss_personnel/my-admin/`, { headers });

  }

  // Get status counts (e.g., active personnel)
  getStatusCounts(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/counts/status/`, { headers });
  }

  // Get performance counts (e.g., excellent, needs attention)
  getPerformanceCounts(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/counts/performance/`, { headers });
  }

  // Get pending submissions for supervisor (count only)
  getPendingSubmissions(): Observable<number> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}evaluations/dashboard/stats/`, { headers })
      .pipe(
        map(res => {
          console.log('Dashboard stats response for pending submissions:', res);
          return res.total_pending || 0;
        })
      );
  }

  getStatusCountsForSupervisor(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/counts/status/supervisor/`, { headers });
  }

  getPerformanceCountsForSupervisor(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/counts/performance/supervisor/`, { headers });
  }

  getAssignedPersonnel(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/assigned-personnel/`, { headers });
  }

  updatePersonnelPerformance(nssId: string, performance: string) {
    const token = this.getJwtToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(
      `${environment.apiUrl}nss_personnel/admin/update-nss/${nssId}/`,
      { performance },
      { headers }
    );
  }

  updatePersonnelStatus(nssId: string, status: string) {
    const token = this.getJwtToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(
      `${environment.apiUrl}nss_personnel/admin/update-nss/${nssId}/`,
      { status },
      { headers }
    );
  }

  getAllPersonnel(): Observable<nss_database[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<nss_database[]>(`${environment.apiUrl}nss_personnel/getAllnssdb/`, { headers });
  }

  getDepartments(): Observable<{ value: string, label: string }[]> {
    return this.http.get<{ value: string, label: string }[]>(`${environment.apiUrl}nss_personnel/departments/`);
  }

  getPerformanceChoices(): Observable<{ value: string, label: string }[]> {
    return this.http.get<{ value: string, label: string }[]>(`${environment.apiUrl}nss_personnel/performance_choices/`);
  }

  getPersonnelDetail(id: string) {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}nss_personnel/personnel/${id}/`, { headers });
  }

  getUnassignedPersonnel(): Observable<nss_database[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{count: number, results: nss_database[]}>(`${environment.apiUrl}unassigned-nss/`, { headers })
      .pipe(
        map(response => response.results), // Extract the results array
        catchError(error => {
          console.error('Error fetching unassigned personnel:', error);
          return throwError(() => error);
        })
      );
  }

  // Get all archived personnel
  getArchivedPersonnel(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/archived/`, { headers });
  }

  // Restore archived personnel
  restoreArchivedPersonnel(id: number, data: any): Observable<any> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${environment.apiUrl}nss_personnel/archived/restore/${id}/`, data, { headers });
  }

  getPersonnelByUserId(userId: string) {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}nss_personnel/personnel/by_user/${userId}/`, { headers });
  }

  getRecentSubmissions(personnelId: string) {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.apiUrl}nss_personnel/personnel/${personnelId}/recent-submissions/`, { headers });
  }

  getAllMyAdmins() {
    return this.http.get<IAdminDatabase[]>(`${environment.apiUrl}nss_personnel/my-admins/`);
  }

}

