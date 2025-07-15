import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  BulkStatusUpdate,
  Evaluation,
  EvaluationDashboardStats,
  EvaluationListResponse,
  EvaluationStatusUpdate
} from '../model/interface/evaluation';
import { DashboardStats } from '../model/interface/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Unauthorized');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getSupervisorEvaluations(params?: {
    status?: string;
    evaluation_type?: string;
    priority?: string;
    page?: number;
    page_size?: number;
  }): Observable<EvaluationListResponse> {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key as keyof typeof params]) {
        query.set(key, String(params[key as keyof typeof params]));
      }
    }
    return this.http.get<EvaluationListResponse>(
      `${environment.API_URL}evaluations/supervisor/evaluations/?${query.toString()}`,
      { headers: this.getAuthHeaders() }
    );
  }

  getEvaluationDetail(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(
      `${environment.API_URL}evaluations/${id}/`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateEvaluationStatus(id: number, update: EvaluationStatusUpdate): Observable<Evaluation> {
    return this.http.patch<Evaluation>(
      `${environment.API_URL}evaluations/${id}/update-status/`,
      update,
      { headers: this.getAuthHeaders() }
    );
  }

  bulkUpdateStatus(payload: BulkStatusUpdate): Observable<{ message: string; updated_count: number; status: string }> {
    return this.http.post<{ message: string; updated_count: number; status: string }>(
      `${environment.API_URL}evaluations/bulk-update/`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  getDashboardStats(): Observable<EvaluationDashboardStats> {
    return this.http.get<EvaluationDashboardStats>(
      `${environment.API_URL}evaluations/dashboard/stats/`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPersonnelSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.API_URL}evaluations/personnel-submissions/`,
      { headers: this.getAuthHeaders() }
    );
  }

  getPersonnelEvaluations(params?: any): Observable<EvaluationListResponse> {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key as keyof typeof params]) {
        query.set(key, String(params[key as keyof typeof params]));
      }
    }
    return this.http.get<EvaluationListResponse>(
      `${environment.API_URL}evaluations/personnel/evaluations/?${query.toString()}`,
      { headers: this.getAuthHeaders() }
    );
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

  getAdminDashboardStats(): Observable<DashboardStats> {
    const url = `${environment.API_URL}evaluations/admin/dashboard/stats/`;
    console.log('🔍 DEBUG: Calling admin dashboard stats API:', url);

    return this.http.get<DashboardStats>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        console.log('🔍 DEBUG: Admin dashboard stats API response:', response);
      })
    );
  }

  getAdminEvaluations(params?: {
    status?: string;
    evaluation_type?: string;
    priority?: string;
    page?: number;
    page_size?: number;
  }): Observable<EvaluationListResponse> {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key as keyof typeof params]) {
        query.set(key, String(params[key as keyof typeof params]));
      }
    }
    const url = `${environment.API_URL}evaluations/admin/evaluations/?${query.toString()}`;
    console.log('🔍 DEBUG: Calling admin evaluations API:', url);

    return this.http.get<EvaluationListResponse>(
      url,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        console.log('🔍 DEBUG: Admin evaluations API response:', response);
        if (response.results && response.results.length > 0) {
          console.log('🔍 DEBUG: First evaluation sample:', response.results[0]);
          console.log('🔍 DEBUG: Date fields in first evaluation:');
          console.log('  - created_at:', response.results[0].created_at);
          console.log('  - due_date:', response.results[0].due_date);
          console.log('  - reviewed_at:', response.results[0].reviewed_at);
        }
      })
    );
  }

  updateAdminEvaluationStatus(id: number, update: EvaluationStatusUpdate): Observable<Evaluation> {
    return this.http.patch<Evaluation>(
      `${environment.API_URL}evaluations/admin/evaluations/${id}/update-status/`,
      update,
      { headers: this.getAuthHeaders() }
    );
  }

  updateAdminPdfFormStatus(id: number, status: string): Observable<any> {
    return this.http.patch<any>(
      `${environment.API_URL}file_uploads/admin/evaluation-forms/${id}/update-status/`,
      { status },
      { headers: this.getAuthHeaders() }
    );
  }
}
