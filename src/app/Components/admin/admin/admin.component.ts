import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LogoutResponse } from '../../../model/interface/auth';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent  implements OnInit{

  constructor(private authService: AuthService, private router: Router) {}
  userName: string = ''; 
  logoutMessage: LogoutResponse = {message: " "}

 ngOnInit(): void {
 this.getUserName();

 }

 getUserName(): void {
  const fullName = localStorage.getItem('user_full_name');
  this.userName = fullName ? fullName : 'User';
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


