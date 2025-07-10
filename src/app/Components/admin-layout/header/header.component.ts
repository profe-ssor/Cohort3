import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../model/interface/dashboard.models';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <!-- Menu Toggle Button -->
      <button mat-icon-button (click)="toggleSidebar()" class="menu-toggle">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Ghana NSS Logo and Title -->
      <div class="logo-section">
        <div class="ghana-flag-mini">
          <div class="flag-stripe red"></div>
          <div class="flag-stripe gold"></div>
          <div class="flag-stripe green"></div>
          <div class="flag-star">★</div>
        </div>
        <div class="logo-text">
          <span class="logo-title">Ghana National Service</span>
          <span class="logo-subtitle">Administration Dashboard</span>
        </div>
      </div>

      <div class="header-spacer"></div>

      <!-- Search Bar (Optional) -->
      <div class="search-section mobile-hidden">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input matInput placeholder="Search personnel, submissions..." />
        </mat-form-field>
      </div>

      <!-- Notifications -->
      <button mat-icon-button class="notification-btn">
        <mat-icon [matBadge]="notificationCount" matBadgeColor="warn" matBadgeSize="small">
          notifications
        </mat-icon>


      </button>

      <!-- User Profile Menu -->
      <button mat-button [matMenuTriggerFor]="userMenu" class="user-profile-btn">
        @if (currentUser?.avatar) {
          <img [src]="currentUser?.avatar" [alt]="currentUser?.name" class="user-avatar" />
        } @else {
          <mat-icon>account_circle</mat-icon>
        }
        <span class="user-name mobile-hidden">{{ currentUser?.name }}</span>
        <mat-icon>arrow_drop_down</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu" class="user-menu">
        <div class="user-menu-header">
          @if (currentUser?.avatar) {
            <img [src]="currentUser?.avatar" [alt]="currentUser?.name" class="user-menu-avatar" />
          }
          <div class="user-menu-info">
            <div class="user-menu-name">{{ currentUser?.name }}</div>
            <div class="user-menu-role">{{ getUserRoleDisplay() }}</div>
            <div class="user-menu-email">{{ currentUser?.email }}</div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <button mat-menu-item>
          <mat-icon>person</mat-icon>
          <span>Profile Settings</span>
        </button>

        <button mat-menu-item (click)="changePassword()">
          <mat-icon>lock</mat-icon>
          <span>Change Password</span>
        </button>

        <button mat-menu-item>
          <mat-icon>settings</mat-icon>
          <span>Preferences</span>
        </button>

        <button mat-menu-item>
          <mat-icon>help</mat-icon>
          <span>Help & Support</span>
        </button>

        <mat-divider></mat-divider>

        <button mat-menu-item (click)="logout()" class="logout-btn">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-md);
      height: 64px;
      background: var(--gradient-primary) !important;
      color: var(--pure-white) !important;
      box-shadow: var(--shadow-md);
      position: relative;
      z-index: 10;
    }

    .menu-toggle {
      margin-right: var(--spacing-md);
      color: var(--pure-white) !important;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .ghana-flag-mini {
      position: relative;
      width: 32px;
      height: 24px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .flag-stripe {
      height: 8px;
      width: 100%;
    }

    .flag-stripe.red { background-color: var(--status-red); }
    .flag-stripe.gold { background-color: var(--accent-gold); }
    .flag-stripe.green { background-color: var(--primary-green); }

    .flag-star {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--soft-black);
      font-size: 8px;
      font-weight: bold;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: var(--font-size-lg);
      font-weight: 500;
      line-height: 1.2;
    }

    .logo-subtitle {
      font-size: var(--font-size-xs);
      opacity: 0.9;
      font-weight: 300;
    }

    .header-spacer {
      flex: 1;
    }

    .search-section {
      margin-right: var(--spacing-lg);
    }

    .search-field {
      width: 300px;
    }

    .search-field ::ng-deep .mat-form-field-wrapper {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
    }

    .search-field ::ng-deep .mat-form-field-outline {
      color: rgba(255, 255, 255, 0.3);
    }

    .search-field ::ng-deep input {
      color: var(--pure-white);
    }

    .search-field ::ng-deep .mat-form-field-placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .notification-btn {
      margin-right: var(--spacing-md);
      color: var(--pure-white) !important;
    }

    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-lg);
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--pure-white) !important;
      transition: background-color 0.3s ease;
    }

    .user-profile-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .user-name {
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-menu {
      min-width: 280px;
    }

    .user-menu-header {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      gap: var(--spacing-md);
    }

    .user-menu-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-menu-info {
      flex: 1;
    }

    .user-menu-name {
      font-weight: 500;
      font-size: var(--font-size-md);
      color: var(--soft-black);
    }

    .user-menu-role {
      font-size: var(--font-size-sm);
      color: var(--primary-green);
      font-weight: 500;
      margin: 2px 0;
    }

    .user-menu-email {
      font-size: var(--font-size-xs);
      color: var(--dark-gray);
    }

    .logout-btn {
      color: var(--status-red) !important;
    }

    .logout-btn mat-icon {
      color: var(--status-red) !important;
    }

    @media (max-width: 768px) {
      .header-toolbar {
        padding: 0 var(--spacing-sm);
      }

      .logo-title {
        font-size: var(--font-size-md);
      }

      .logo-subtitle {
        display: none;
      }

      .search-section {
        display: none;
      }

      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser: User | null = null;
  notificationCount = 5;

  constructor() {
    this.authService.currentUser$.subscribe(user => {
       console.log('User:', user);
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case 'super_admin': return 'Super Administrator';
      case 'regional_admin': return 'Regional Administrator';
      case 'district_admin': return 'District Administrator';
      case 'supervisor': return 'Supervisor';
      default: return 'User';
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }
}
