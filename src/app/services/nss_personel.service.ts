import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment.development";
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

}

