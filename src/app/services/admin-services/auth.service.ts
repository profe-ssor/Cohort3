import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, delay, tap } from 'rxjs';
import { User, UserRole } from '../../model/interface/dashboard.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({
providedIn: 'root'
})
export class AuthService {
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
constructor(private http: HttpClient) {}

getCurrentUser(): User | null {
return this.currentUserSubject.value;
}

login(email: string, password: string): Observable<User> {
// Replace with real authentication API call
return this.http.post<User>(`${environment.API_URL}auth/login/`, { email, password }).pipe(
  tap(user => this.currentUserSubject.next(user))
);
}

logout(): Observable<boolean> {
// Replace with real logout logic if needed
this.currentUserSubject.next(null);
return of(true);
}

hasPermission(permission: string): boolean {
const user = this.getCurrentUser();
return user?.permissions.includes(permission) || false;
}

isAuthenticated(): boolean {
return this.currentUserSubject.value !== null;
}

updateUserProfile(updates: Partial<User>): Observable<User> {
const currentUser = this.getCurrentUser();
if (currentUser) {
// Replace with real API call
return this.http.patch<User>(`${environment.API_URL}auth/profile/`, updates).pipe(
  tap(user => this.currentUserSubject.next(user))
);
}
throw new Error('No authenticated user');
}
}
