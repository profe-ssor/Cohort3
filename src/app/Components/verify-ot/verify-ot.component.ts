import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Constant } from '../../constant/constant';
import { AuthService } from '../../services/auth.service';
import { OtpResponse, OtpVerification } from '../../model/interface/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-ot',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './verify-ot.component.html',
  styleUrl: './verify-ot.component.css'
})
export class VerifyOtComponent {
response : OtpResponse | null = null;
otpService = inject(AuthService);
router = inject(Router);
otpData: OtpVerification = { email: '', otp_code: '' };
constant = Constant;

onSubmit() {
    this.otpService.verifyOtp(this.otpData).subscribe({
      next: (res: OtpResponse) => {
        this.response = res; // Store response
        console.log(res.message); // Example usage
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error verifying OTP:', err);
      }
    });
  }


}
