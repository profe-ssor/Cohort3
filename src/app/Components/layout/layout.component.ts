import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LogoutResponse } from '../../model/interface/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logoutMessage: LogoutResponse = {message: " "}


  logout() {
    console.log('Starting logout process');
    this.authService.logout().subscribe({
      next: (res: LogoutResponse) => {
        this.logoutMessage = res;
        console.log('Logout response received:', res);
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

