import { Component, OnInit } from '@angular/core';
import { nss_database, nss_databaseResponse } from '../../model/interface/auth';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { Constant } from '../../constant/constant';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';


@Component({
  selector: 'app-nss-database',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './nss-database.component.html',
  styleUrl: './nss-database.component.css'
})
export class NssDatabaseComponent implements OnInit {
  successMessage: string | null = null;
  errorMessage: string = '';
  isLoading = false;
  isLoginLoading = false;
  constant = Constant;
  nssdb: nss_database = {
    user_id: 0,
    full_name: '',
    nss_id: '',
    ghana_card_record: '',
    phone: '',
    start_date: '',
    end_date: '',
    assigned_institution: '',
    region_of_posting: '',
    department: '',
  };
  respones: nss_databaseResponse = {
    message: '',
    data: []
  };
  departments: { value: string, label: string }[] = [];
  startDateError: string = '';
  constructor(private nssauth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.nssdb.user_id = parseInt(userId);
    } else {
      this.router.navigate(['/signup']);
    }
    // Fetch department choices
    this.http.get<{ value: string, label: string }[]>(environment.API_URL + 'nss_personnel/departments/').subscribe({
      next: (data) => { this.departments = data; },
      error: (err) => { this.departments = []; }
    });
  }

  validateStartDate(startDate: string): boolean {
    if (!startDate) return true;
    const year = parseInt(startDate.slice(0, 4), 10);
    const currentYear = new Date().getFullYear();
    if (year !== currentYear) {
      this.startDateError = `Batch year must be ${currentYear}. You entered ${year}.`;
      return false;
    }
    this.startDateError = '';
    return true;
  }

  onSubmit() {
    if (this.isLoading) return;

    // Frontend year validation
    if (!this.validateStartDate(this.nssdb.start_date)) {
      alert(this.startDateError);
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.nssauth.nssDatabase(this.nssdb).subscribe({
      next: (res: nss_databaseResponse) => {
        if (res.message) {
          this.successMessage = res.message;
          window.alert(this.successMessage);
          console.log(this.successMessage);
          setTimeout(() => this.router.navigate(['/login']), 1500);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'An error occurred. Please try again.';
        alert(this.errorMessage);
        console.error('Registration error:', error);
        this.isLoading = false;
      }
    });
  }

  onLogin(): void {
    this.isLoginLoading = true;

    setTimeout(() => {
      this.isLoginLoading = false;
      this.router.navigate(['/login']);
    }, 1000);
  }
}
