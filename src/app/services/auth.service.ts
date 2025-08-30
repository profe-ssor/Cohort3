import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { tap, catchError, timeout } from 'rxjs/operators';
import { Credentials, LoginResponse,  LogoutResponse,  nss_database,  nss_databaseResponse,  OtpResponse, OtpVerification, registerResponse, registerUser, ResendOTP, ResendOtpResponse,  supervisor_database,  supervisors_databaseResponse,  UserCounts, PasswordChangeRequest, PasswordChangeResponse, PasswordResetRequest, PasswordResetRequestResponse, PasswordResetConfirm, PasswordResetConfirmResponse } from '../model/interface/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<registerUser | null> = new BehaviorSubject<registerUser | null>(null);
  public currentUser$: Observable<any | null> = this.currentUserSubject.asObservable();
  constructor(
    private http: HttpClient,
    private router: Router
  ) { this.loadStoredUserData(); }


  // Load user data from localStorage if available
  private loadStoredUserData(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        this.currentUserSubject.next(parsedUserData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    }
  }



  // Register a new user
  register(userData: registerUser): Observable<registerResponse> {
    return this.http.post<registerResponse>(`${environment.apiUrl}register/`, userData).pipe(
      tap(response => {
        if (response.id){
          localStorage.setItem('user_id', response.id.toString());
        }
      })
    );
  }

  // otp verification
  verifyOtp(userData: OtpVerification): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${environment.apiUrl}verify-otp/`, userData);
  }

  // supervisor_dashboard
  supervisorDatabase(userData: supervisor_database): Observable<supervisors_databaseResponse > {
    return this.http.post<supervisors_databaseResponse>(`${environment.apiUrl}supervisor-dashboard/`, userData);
  }
  // nss_database
  nssDatabase(userData: nss_database): Observable<nss_databaseResponse > {
    return this.http.post<nss_databaseResponse>(`${environment.apiUrl}nss_personnel/nssdb/`, userData);
  }
  // Store the JWT token in localStorage
  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Get the JWT token from localStorage
  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get the refresh token from localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Refresh the access token using refresh token
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<any>(`${environment.apiUrl}token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        if (response.access) {
          this.storeJwtToken(response.access);
          console.log('Token refreshed successfully');
        }
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // If refresh fails, clear all tokens and redirect to login
        this.removeJwtToken();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  private storeUserFullName(fullName: string): void {
    localStorage.setItem('user_full_name', fullName);
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
  // Login a user
login(userData: Credentials): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${environment.apiUrl}login/`, userData)
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
          console.log('Storing user data and navigating...');
          console.log('Full response:', response);
          console.log('User object:', response.user);
          localStorage.setItem('userData', JSON.stringify(response.user));

          // Get role and full_name from the user object (backend returns them inside user object)
          const role = response.user.role;
          const fullName = response.user.full_name;

          this.storeUserRole(role);
          this.storeUserFullName(fullName);
          console.log('User role:', role);
          console.log('User full name:', fullName);
          this.navigateBasedOnRole(role);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Don't transform the error, just pass it through
        return throwError(() => error);
      })
    );
}

  private navigateBasedOnRole(role: string): void {
    console.log('Navigating based on role:', role);
    switch (role) {
      case 'admin':
        console.log('Navigating to admin dashboard');
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'supervisor':
        console.log('Navigating to supervisor dashboard');
        this.router.navigate(['/supervisor-dashboard']);
        break;
      case 'user':
        console.log('Navigating to personnel dashboard');
        this.router.navigate(['/personnel/persneldashboard']);
        break;
      default:
        console.log('Unknown role, navigating to root');
        this.router.navigate(['/']);
    }
  }

  // get all regions from the server
getRegions(): Observable<any> {
    return this.http.get(`${environment.apiUrl}regions/`);
  }

getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.getJwtToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
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

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  });

  // If no tokens exist, just do a client-side logout
  if (!refreshToken || !accessToken) {
    this.removeJwtToken();
    this.router.navigate(['/login']); // Always navigate to login
    return of({ message: 'Logout successful' });
  }

  return this.http.post<LogoutResponse>(
    `${environment.apiUrl}logout/`,
    { refresh_token: refreshToken },
    { headers: headers }
  ).pipe(
    timeout(5000),
    tap(() => {
      console.log('Logout successful');
      this.removeJwtToken();
      this.router.navigate(['/login']); // Always navigate to login
    }),
    catchError((error) => {
      console.error("Logout failed", error);
      // Still perform client-side logout
      this.removeJwtToken();
      this.router.navigate(['/login']); // Always navigate to login
      // Return a success message anyway - user doesn't need to know about backend issues
      return of({ message: 'Logged out successfully' });
    })
  );
}


  getUserCounts(): Observable<UserCounts> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated TO ACCESS Count Users.");
      return throwError(() => new Error("Unauthorized"));
    }
    if (!token) {
      console.error("User must be authenticated to access user counts.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<UserCounts>(`${environment.apiUrl}user-counts/`, { headers })
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
    return this.http.post<ResendOtpResponse>(`${environment.apiUrl}resend-otp/`, userData);
  }

  // Password management methods
  changePassword(passwordData: PasswordChangeRequest): Observable<PasswordChangeResponse> {
    return this.http.post<PasswordChangeResponse>(
      `${environment.apiUrl}change-password/`,
      passwordData,
      { headers: this.getAuthHeaders() }
    );
  }

  requestPasswordReset(resetData: PasswordResetRequest): Observable<PasswordResetRequestResponse> {
    return this.http.post<PasswordResetRequestResponse>(
      `${environment.apiUrl}request-password-reset/`,
      resetData
    );
  }

  confirmPasswordReset(confirmData: PasswordResetConfirm): Observable<PasswordResetConfirmResponse> {
    return this.http.post<PasswordResetConfirmResponse>(
      `${environment.apiUrl}confirm-password-reset/`,
      confirmData
    );
  }

  getUser(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;

  }



}
