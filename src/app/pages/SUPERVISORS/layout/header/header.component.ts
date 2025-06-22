import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LogoutResponse } from '../../../../model/interface/auth';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  searchQuery = '';
  showProfileMenu = signal(false);
  unreadCount = signal(3);
  logoutMessage: LogoutResponse = { message: " " };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getUserName();
  }

  getUserName(): void {
    const fullName = localStorage.getItem('user_full_name');
    this.userName = fullName ? fullName : 'User';
  }

  getUserRole(): string {
    return localStorage.getItem('userRole') || 'User';
  }

  getCurrentUserInitials(): string {
    const name = this.userName;
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value;
    // Implement search logic here if needed
  }

  toggleNotifications() {
    // Implement notification logic if needed
  }

  toggleProfileMenu() {
    this.showProfileMenu.update(value => !value);
  }

  logout() {
    console.log('Starting logout process');
    this.authService.logout().subscribe({
      next: (res: LogoutResponse) => {
        this.logoutMessage = res;
        console.log('Logout response received:', res);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error in logout subscription:', err);
      },
      complete: () => {
        console.log('Logout process completed');
      }
    });
  }
}
