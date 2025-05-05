import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LogoutResponse, UserCounts } from '../../../model/interface/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userName: string = ''
  logoutMessage: LogoutResponse = {message: " "}
  userCounts: UserCounts = {
    total_users: 0,
    total_normal_users: 0,
    total_supervisors: 0,
    total_admins: 0
  };
  isLoadingCounts = false;
  countError: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('Dashboard component initialized');
    this.getCounts();
    this.getUserName();
  }

  getUserName(): void {
    const fullName = localStorage.getItem('user_full_name');
    this.userName = fullName ? fullName : 'User';
  }



  getCounts(): void {
    this.isLoadingCounts = true;
    console.log('Fetching user counts...');

    this.authService.getUserCounts().subscribe({
      next: (response: UserCounts) => {
        console.log('User counts received:', response);
        this.userCounts = response;
      },
      error: (err) => {
        console.error('Error fetching user counts:', err);
        this.countError = 'Failed to load user statistics';

        // Add more detailed error handling
        if (err.status === 401) {
          console.error('Authentication error - token may be invalid');
          // Potentially redirect to login
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          console.error('Endpoint not found - check API URL');
        }
      },
      complete: () => {
        console.log('User counts request completed');
        this.isLoadingCounts = false;
      },
    });
  }

  logout(){
    console.log('Starting logout process');
        this.authService.logout().subscribe({
          next: (res: LogoutResponse) => {
            this.logoutMessage = res;
            console.log('Logout response received:', res);
            this.router.navigate(['/resend-otp']);
          },
          error: (err) => {
            console.error('Error in logout subscription:', err);
            // This shouldn't happen with our improved error handling
          },
          complete: () => {
            console.log('Logout process completed');
            // No need to navigate here as it's handled in the service
          }
        });
  }
}
