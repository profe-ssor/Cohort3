import { Component, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ResendOTP, ResendOtpResponse } from '../../model/interface/auth';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Constant } from '../../constant/constant';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-resen-otp',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './resen-otp.component.html',
  styleUrl: './resen-otp.component.css'
})
export class ResenOtpComponent {

  resendotp: ResendOTP = { email: '' };
  response: ResendOtpResponse | null = null;
  resendotpService = inject(AuthService);
  router = inject(Router);
  constant = Constant;

  resendOtp() {
    if (!this.resendotp.email) {
      alert('Please enter your email address');
      return;
    }

    this.resendotpService.resendOtp(this.resendotp).subscribe({
      next: (res: ResendOtpResponse) => {
        this.response = res;
        console.log(res.message);
        this.router.navigate(['/otp-verify']);
      },
      error: (err) => {
        console.error('Error resending OTP:', err);
        alert('Failed to resend OTP. Please try again.');
      }
    });
  }
}