import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ISupervisorDatabase } from '../model/interface/supervisor';
import { SupervisorCount } from '../model/interface/supervor';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getJwtToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // --- Restored for backward compatibility ---
  getSupervisorCounts(): Observable<SupervisorCount[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be authenticated to send messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<SupervisorCount[]>(`${environment.API_URL}nss_personnel/counts/grouped-by-supervisor/`, { headers })
      .pipe(
        tap((data: SupervisorCount[]) => console.log('API Response:', data)),
        catchError((error: any) => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }

  // 1. Fetch all supervisors
  getAllSupervisors(): Observable<ISupervisorDatabase[]> {
    return this.http.get<ISupervisorDatabase[]>(`${environment.API_URL}nss_supervisor/getAllsupervisors/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 2. Fetch supervisors assigned to current admin
  getAssignedSupervisors(): Observable<ISupervisorDatabase[]> {
    return this.http.get<ISupervisorDatabase[]>(`${environment.API_URL}available-supervisors/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 3. Assign supervisors to admin
  assignSupervisorsToAdmin(supervisorIds: number[]): Observable<any> {
    return this.http.post(`${environment.API_URL}assign-supervisors-to-admin/`, { supervisor_ids: supervisorIds }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 4. Assign supervisor to NSS personnel
  assignSupervisorToPersonnel(nssId: number, supervisorId: number): Observable<any> {
    return this.http.post(`${environment.API_URL}assign-supervisor/${nssId}/`, { supervisor_id: supervisorId }, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 5. Add supervisor
  addSupervisor(data: ISupervisorDatabase): Observable<any> {
    return this.http.post(`${environment.API_URL}nss_supervisor/supervisorsdb/`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 6. Edit supervisor
  editSupervisor(id: number, data: Partial<ISupervisorDatabase>): Observable<any> {
    return this.http.put(`${environment.API_URL}nss_supervisor/update/${id}/`, data, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // 7. Delete supervisor
  deleteSupervisor(id: number): Observable<any> {
    return this.http.delete(`${environment.API_URL}supervisorsdb/${id}/`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Utility methods
  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
