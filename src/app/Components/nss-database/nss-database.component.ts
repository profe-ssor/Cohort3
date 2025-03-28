import { Component, OnInit } from '@angular/core';
import { nss_database, nss_databaseResponse } from '../../model/interface/auth';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Constant } from '../../constant/constant';

@Component({
  selector: 'app-nss-database',
  standalone: true,
  imports: [FormsModule, NgIf],
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

  };
  respones: nss_databaseResponse = {
    message: '',
  };
  constructor(private nssauth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id'); // Get stored user ID
    if (userId) {
      this.nssdb.user_id = parseInt(userId); // Assign it to the form
    } else {
      this.router.navigate(['/signup']); // Redirect if not logged in
    }
  }

  onSubmit() {
    if (this.isLoading) return;

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
    }, 1000); // Simulates a short delay before navigating
  }

}
