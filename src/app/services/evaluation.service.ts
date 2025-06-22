import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  BulkStatusUpdate,
  Evaluation,
  EvaluationDashboardStats,
  EvaluationListResponse,
  EvaluationStatusUpdate
} from '../model/interface/evaluation';

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

  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
}
