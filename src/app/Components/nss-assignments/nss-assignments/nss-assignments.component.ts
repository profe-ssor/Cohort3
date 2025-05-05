import { Component, OnInit } from '@angular/core';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { ISupervisorDatabase } from '../../../model/interface/supervisor';
import { NgIf } from '@angular/common';
import { IAdminDatabase } from '../../../model/interface/admin';
import { AuthService } from '../../../services/auth.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-nss-assignments',
  standalone: true,
  imports: [NgIf],
  templateUrl: './nss-assignments.component.html',
  styleUrl: './nss-assignments.component.css'
})
export class NssAssignmentsComponent implements OnInit {
  loading: boolean = false;
  userName: string = '';
  supervisor: ISupervisorDatabase | null = null;
  admin: IAdminDatabase | null = null;

  constructor(private nssService: NssPersonelService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.getUserName();
    this.getMySupervisor();
    this.getMyAdnib();
  }

  getUserName(): void {
    const fullName = localStorage.getItem('user_full_name');
    this.userName = fullName ? fullName : 'User';
  }

  getMySupervisor() {
    this.loading = true;
    this.nssService.getMySupervisor().subscribe({
      next: (supervisorData) => {
        this.supervisor = supervisorData;
        console.log('Supervisor data loaded:', this.supervisor);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching supervisor data:', error);
        this.loading = false;
      }
    });
  }

  getMyAdnib() {
    this.loading = true;
    this.nssService.getMyAdmin().subscribe({
      next: (adminData) => {
        this.admin = adminData;
        console.log('Admin data loaded:', this.admin);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching admin data:', error);
        this.loading = false;
      }
    });
  }

  goToAdminChat() {
    console.log('Navigating to admin chat');

    if (this.admin && this.admin.user) {
      // Using the 'user' property instead of 'user_id'
      const navigationExtras: NavigationExtras = {
        queryParams: {
          receiverId: this.admin.user,
          receiverName: this.admin.full_name
        }
      };

      console.log('Navigation params:', navigationExtras);
      this.router.navigate(['/message'], navigationExtras);
    } else {
      console.error('Admin data not available or missing user property');
    }
  }

  navigateToReports() {
    console.log('Navigating to reports');
    // Implement your navigation logic here
  }

  goToSupervisorChat() {
    console.log('Navigating to supervisor chat');

    if (this.supervisor && this.supervisor.user) {
      // Using the 'user' property instead of 'user_id'
      const navigationExtras: NavigationExtras = {
        queryParams: {
          receiverId: this.supervisor.user,
          receiverName: this.supervisor.full_name
        }
      };

      console.log('Navigation params:', navigationExtras);
      this.router.navigate(['/message'], navigationExtras);
    } else {
      console.error('Supervisor data not available or missing user property');
    }
  }
}
