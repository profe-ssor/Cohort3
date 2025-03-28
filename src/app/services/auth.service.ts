import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { tap, catchError, timeout } from 'rxjs/operators';
import { Credentials, LoginResponse,  LogoutResponse,  nss_database,  nss_databaseResponse,  OtpResponse, OtpVerification, registerResponse, registerUser, ResendOTP, ResendOtpResponse,  supervisor_database,  supervisors_databaseResponse,  UserCounts } from '../model/interface/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<registerUser | null> = new BehaviorSubject<registerUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Register a new user
  register(userData: registerUser): Observable<registerResponse> {
    return this.http.post<registerResponse>(`${environment.API_URL}register/`, userData).pipe(
      tap(response => {
        if (response.id){
          localStorage.setItem('user_id', response.id.toString());
        }
      })
    );
  }

  // otp verification
  verifyOtp(userData: OtpVerification): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${environment.API_URL}verify-otp/`, userData);
  }

  // supervisor_dashboard
  supervisorDatabase(userData: supervisor_database): Observable<supervisors_databaseResponse > {
    return this.http.post<supervisors_databaseResponse>(`${environment.API_URL}supervisor-dashboard/`, userData);
  }
  // nss_database
  nssDatabase(userData: nss_database): Observable<nss_databaseResponse > {
    return this.http.post<nss_databaseResponse>(`${environment.API_URL}nssdb/`, userData);
  }
  // Store the JWT token in localStorage
  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Get the JWT token from localStorage
  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
  // Login a user
login(userData: Credentials): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${environment.API_URL}login/`, userData)
    .pipe(
      tap(response => {
        console.log('API Response:', response);
        if (response && response.access) {
          this.storeJwtToken(response.access);
        }
        if (response && response.refresh) {
          localStorage.setItem('refresh_token', response.refresh);
        }
        if (response && response.user) {
          this.storeUserRole(response.user.role);
          this.navigateBasedOnRole(response.user.role);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Don't transform the error, just pass it through
        return throwError(() => error);
      })
    );
}

  private navigateBasedOnRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'supervisor':
        this.router.navigate(['/supervisor-dashboard']);
        break;
      case 'user':
        this.router.navigate(['/persneldashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  // get all regions from the server
getRegions(): Observable<any> {
    return this.http.get(`${environment.API_URL}regions/`);
  }

getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }


  // Remove the JWT token from localStorage
  removeJwtToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.clear();
    // Clear any user data stored in the service
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getJwtToken();
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

// auth.service.ts
logout(): Observable<LogoutResponse> {
  const refreshToken = localStorage.getItem('refresh_token');
  const accessToken = localStorage.getItem('access_token');

  // If no tokens exist, just do a client-side logout
  if (!refreshToken || !accessToken) {
    this.removeJwtToken();
    this.router.navigate(['/resend-otp']);
    return of({ message: 'Logout successful' });
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  });
  return this.http.post<LogoutResponse>(
    `${environment.API_URL}logout/`,
    { refresh_token: refreshToken },
    { headers: headers }
  ).pipe(
    timeout(5000),
    tap(() => {
      console.log('Logout successful');
      this.removeJwtToken();
      this.router.navigate(['/resend-otp']);
    }),
    catchError((error) => {
      console.error("Logout failed", error);
      // Still perform client-side logout
      this.removeJwtToken();
      this.router.navigate(['/resend-otp']);
      // Return a success message anyway - user doesn't need to know about backend issues
      return of({ message: 'Logged out successfully' });
    })
  );
}


  getUserCounts(): Observable<UserCounts> {
    return this.http.get<UserCounts>(`${environment.API_URL}user-counts/`)
      .pipe(
        tap(response => console.log('Raw API response:', response)),
        catchError((error) => this.handleError(error)) // Fixed: Wrap in arrow function
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Handle token expiration
      if (error.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        this.removeJwtToken();
        this.router.navigate(['/login']);
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // resend otp token
  resendOtp(userData: ResendOTP): Observable<ResendOtpResponse> {
    return this.http.post<ResendOtpResponse>(`${environment.API_URL}resend-otp/`, userData);
  }


}
