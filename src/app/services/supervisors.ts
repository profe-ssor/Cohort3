import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SupervisorCount } from '../model/interface/supervor';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  constructor(private http: HttpClient) {}

  getSupervisorCounts(): Observable<SupervisorCount[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be authenticated to send messages.");
      return throwError(() => new Error("Unauthorized"));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<SupervisorCount[]>(`${environment.API_URL}nss_personnel/counts/grouped-by-supervisor/`, { headers })
      .pipe(
        tap(data => console.log('API Response:', data)), // Debug log
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
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
