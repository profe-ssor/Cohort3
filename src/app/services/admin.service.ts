import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment.development";
import { IAdminDatabase } from "../model/interface/admin";



@Injectable({
  providedIn: 'root'
})
export class NssPersonelService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  // get my supervisor
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

