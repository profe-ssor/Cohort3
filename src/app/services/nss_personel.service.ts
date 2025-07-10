import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment.development";
import { ISupervisorDatabase } from "../model/interface/supervisor";
import { IAdminDatabase } from "../model/interface/admin";
import { LoginResponse, nss_database, nss_databaseResponse } from "../model/interface/auth";
import { map } from "rxjs/operators";



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
    return this.http.post<nss_databaseResponse>(`${environment.API_URL}nss_personnel/nssdb/`, userData);
  }
  // get my supervisor
  getMySupervisor(): Observable<ISupervisorDatabase> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be logged in");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<ISupervisorDatabase>(`${environment.API_URL}nss_personnel/my-supervisor/`, { headers });

  }


  getMyAdmin(): Observable<IAdminDatabase> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be logged in");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IAdminDatabase>(`${environment.API_URL}nss_personnel/my-admin/`, { headers });

  }

  // Get status counts (e.g., active personnel)
  getStatusCounts(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.API_URL}nss_personnel/counts/status/`, { headers });
  }

  // Get performance counts (e.g., excellent, needs attention)
  getPerformanceCounts(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.API_URL}nss_personnel/counts/performance/`, { headers });
  }

  // Get pending submissions for supervisor (count only)
  getPendingSubmissions(): Observable<number> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.API_URL}evaluations/dashboard/stats/`, { headers })
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
    return this.http.get<any[]>(`${environment.API_URL}nss_personnel/counts/status/supervisor/`, { headers });
  }

  getPerformanceCountsForSupervisor(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.API_URL}nss_personnel/counts/performance/supervisor/`, { headers });
  }

  getAssignedPersonnel(): Observable<any[]> {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${environment.API_URL}nss_personnel/assigned-personnel/`, { headers });
  }

  updatePersonnelPerformance(nssId: string, performance: string) {
    const token = this.getJwtToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(
      `${environment.API_URL}nss_personnel/admin/update-nss/${nssId}/`,
      { performance },
      { headers }
    );
  }

  getAllPersonnel(): Observable<nss_database[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<nss_database[]>(`${environment.API_URL}nss_personnel/getAllnssdb/`, { headers });
  }

  getDepartments(): Observable<{ value: string, label: string }[]> {
    return this.http.get<{ value: string, label: string }[]>(`${environment.API_URL}nss_personnel/departments/`);
  }

  getPerformanceChoices(): Observable<{ value: string, label: string }[]> {
    return this.http.get<{ value: string, label: string }[]>(`${environment.API_URL}nss_personnel/performance_choices/`);
  }

  getPersonnelDetail(id: string) {
    const token = this.getJwtToken();
    if (!token) return throwError(() => new Error('Unauthorized'));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.API_URL}nss_personnel/personnel/${id}/`, { headers });
  }

  getUnassignedPersonnel(): Observable<nss_database[]> {
    const token = this.getJwtToken();
    if (!token) {
      return throwError(() => new Error('Unauthorized'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<nss_database[]>(`${environment.API_URL}unassigned-nss/`, { headers });
  }

}

