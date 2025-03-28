import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { registerResponse, registerUser } from '../../model/interface/auth';
import { Constant } from '../../constant/constant';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgIf],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent {
  isLoading = false;
  isLoginLoading = false;
  user: registerUser = {
    username: '',
    gender: '',
    email: '',
    user_type: '',
    password: '',
  };

  regions =[
  {value: '1', name: 'Greater Accra'},
  {value: '2', name: 'Western'},
  {value: '3', name: 'Ashanti'},
  {value: '4', name: 'Eastern'},
  {value: '5', name: 'Central'},
  {value: '6', name: 'Volta'},
  {value: '7', name: 'Northern'},
  {value: '8', name: 'Western North'},
  {value: '9', name: 'Oti'},
  {value: '10', name: 'Ahafo'},
  {value: '11', name: 'Bono'},
  {value: '12', name: 'Bono East'},
  {value: '13', name: 'Upper East'},
  {value: '14', name: 'Upper West'},
  {value: '15', name: 'North East'},
  {value: '16', name: 'Western Region'},
  ];

  // formatDates(): void {
  //   this.user.start_date = new Date(this.user.start_date).toISOString().split('T')[0];
  //   this.user.end_date = new Date(this.user.end_date).toISOString().split('T')[0];
  //   this.user.date_of_birth = new Date(this.user.date_of_birth).toISOString().split('T')[0];
  // }


  constant = Constant;
  errorMessage: string = '';
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }





onSubmit(): void {
  if (this.isLoading) return;

  this.isLoading = true;
  // this.formatDates();
  console.log('User data being sent:', this.user);

  // Send user data to the server for registration
  this.authService.register(this.user).subscribe({
    next: (response: registerResponse) => {
    
      if (response.id) {
        localStorage.setItem('user_id', response.id.toString()); // Save user ID
      }

       if (response.message) {
        this.successMessage = response.message;
        window.alert(this.successMessage);
        console.log(this.successMessage);

       }

      this.router.navigate(['/otp-verify']);
    },
    error: (error) => {
      // Handle error response
      this.errorMessage = error.error.error || 'An error occurred';

      // Check if error is due to network or server issue
      if (error.status === 0) {
        this.errorMessage = 'Network error: Unable to reach the server. Please try again later.';
      } else if (error.status === 400) {
        // Bad request error (possibly validation failure)
        this.errorMessage = 'Registration failed. Please check your input and try again.';
      } else if (error.status === 500) {
        // Server error
        this.errorMessage = 'Internal server error. Please try again later.';
      } else {
        // Default error message for other cases
        this.errorMessage = 'An unknown error occurred. Please try again.';
      }

      // Display error to the user
      alert(this.errorMessage);
      console.error('Registration error:', error);
      this.isLoading = false;
      // Clear form fields
      this.user = {
        username: '',
        gender: '',
        email: '',
        password: '',
        user_type: '',
      };
    },
    complete: () => {

      console.log('Registration request completed.');
      this.isLoading = false;
    },

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



