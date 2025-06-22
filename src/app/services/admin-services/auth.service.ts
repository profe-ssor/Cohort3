import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import { User, UserRole } from '../../model/interface/dashboard.models';
@Injectable({
providedIn: 'root'
})
export class AuthService {
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
constructor() {
// Initialize with mock admin user
this.initializeMockUser();
 }
private initializeMockUser(): void {
const mockUser: User = {
id: 'admin-001',
name: 'Dr. Kwame Asante',
email: 'k.asante@nss.gov.gh',
role: UserRole.SUPER_ADMIN,
permissions: [
'view_dashboard',
'manage_personnel',
'approve_submissions',
'manage_supervisors',
'generate_reports',
'system_admin'
 ],
lastLogin: new Date(),
avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
 };
this.currentUserSubject.next(mockUser);
 }
getCurrentUser(): User | null {
return this.currentUserSubject.value;
 }
login(email: string, password: string): Observable<User> {
// Mock login - in real implementation, this would call an authentication API
return of(this.currentUserSubject.value!).pipe(delay(1000));
 }
logout(): Observable<boolean> {
this.currentUserSubject.next(null);
return of(true).pipe(delay(300));
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
const updatedUser = { ...currentUser, ...updates };
this.currentUserSubject.next(updatedUser);
return of(updatedUser).pipe(delay(500));
 }
throw new Error('No authenticated user');
 }
}
