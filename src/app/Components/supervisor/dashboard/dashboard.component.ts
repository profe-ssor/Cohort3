import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserCounts } from '../../../model/interface/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgFor, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userCounts: UserCounts = {
    total_users: 0,
    nssmembers_count: 0,
    supervisors_count: 0,
    admins_count: 0
  };
  isLoadingCounts = false;
  countError: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('Dashboard component initialized');
    this.getCounts();
  }

  menuItems = [
    {
      title: 'Personel List',
      submenu: [
        {
          title: 'Ashanti',
          link: '/dashboard/pesonel-table'
        }
      ],
    },
  ];

  reportItems = [
    {
      title: 'Generate Report',
      submenu: [
        {
          title: 'Daily Report',
        },
        {
          title: 'Weekly Report',
        },
        {
          title: 'Monthly Report',
        },
        {
          title: 'Yearly Report',
        }
      ],
    },
  ];

  activeIndex: number | null = null;
  reportIndex: number | null = null;
  successMessage: string | null = null;

  toggleMenu(index: number): void {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  reportToggleMenu(index: number): void {
    this.reportIndex = this.reportIndex === index ? null : index;
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
}
