import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/admin-services/auth.service';
import { EvaluationService } from '../../../services/evaluation.service';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  permission?: string;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  template: `
    <div class="sidebar-container" [class.collapsed]="!isExpanded">
      <!-- Ghana Flag Accent -->
      <div class="ghana-flag-stripe"></div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        @for (item of navigationItems; track item.id) {
          @if (hasPermission(item.permission)) {
            <div class="nav-item-container">
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active"
                class="nav-item"
                [class.has-badge]="item.badge && item.badge > 0"
                [matTooltip]="!isExpanded ? item.label : ''"
                matTooltipPosition="right"
              >
                <mat-icon class="nav-icon" [matBadge]="item.badge || 0"
                         [matBadgeHidden]="!item.badge || item.badge === 0"
                         matBadgeColor="warn" matBadgeSize="small">
                  {{ item.icon }}
                </mat-icon>

                @if (isExpanded) {
                  <span class="nav-label">{{ item.label }}</span>
                }

                @if (item.badge && item.badge > 0 && isExpanded) {
                  <span class="nav-badge">{{ item.badge }}</span>
                }
              </a>

              @if (item.children && isExpanded) {
                <div class="nav-children">
                  @for (child of item.children; track child.id) {
                    @if (hasPermission(child.permission)) {
                      <a
                        mat-list-item
                        [routerLink]="child.route"
                        routerLinkActive="active"
                        class="nav-child-item"
                      >
                        <mat-icon class="nav-child-icon">{{ child.icon }}</mat-icon>
                        <span class="nav-child-label">{{ child.label }}</span>
                      </a>
                    }
                  }
                </div>
              }
            </div>
          }
        }

        <mat-divider class="nav-divider"></mat-divider>

        <!-- System Section -->
        @for (item of systemItems; track item.id) {
          @if (hasPermission(item.permission)) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item system-item"
              [matTooltip]="!isExpanded ? item.label : ''"
              matTooltipPosition="right"
            >
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              @if (isExpanded) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        }
      </nav>

      <!-- Footer Information -->
      @if (isExpanded) {
        <div class="sidebar-footer">
          <div class="version-info">
            <div class="version-label">Powered by PROFESSOR</div>
            <div class="version-number">0549361771</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100%;
      background-color: var(--pure-white);
      border-right: 1px solid var(--border-gray);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      width: 280px;
      overflow: hidden;
    }

    .sidebar-container.collapsed {
      width: 64px;
    }

    .ghana-flag-stripe {
      height: 4px;
      width: 100%;
      background: linear-gradient(to right,
        var(--status-red) 0% 33.33%,
        var(--accent-gold) 33.33% 66.66%,
        var(--primary-green) 66.66% 100%);
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-md) 0;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-item-container {
      margin-bottom: var(--spacing-xs);
    }

    .nav-item {
      display: flex !important;
      align-items: center !important;
      padding: var(--spacing-md) var(--spacing-lg) !important;
      margin: 0 var(--spacing-sm) !important;
      border-radius: var(--radius-md) !important;
      transition: all 0.3s ease !important;
      text-decoration: none !important;
      color: var(--dark-gray) !important;
      position: relative !important;
      min-height: 48px !important;
    }

    .nav-item:hover {
      background-color: var(--primary-gray) !important;
      color: var(--soft-black) !important;
    }

    .nav-item.active {
      background: linear-gradient(135deg,
        rgba(0, 128, 0, 0.1) 0%,
        rgba(0, 0, 0, 0.05) 100%) !important;
      color: var(--primary-green) !important;
      border-left: 4px solid var(--primary-green);
    }

    .nav-icon {
      margin-right: var(--spacing-md);
      font-size: 20px;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .collapsed .nav-icon {
      margin-right: 0;
    }

    .nav-label {
      flex: 1;
      font-weight: 500;
      font-size: var(--font-size-sm);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      background-color: var(--status-red);
      color: var(--pure-white);
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 500;
      min-width: 18px;
      text-align: center;
    }

    .nav-children {
      margin-left: var(--spacing-xl);
      border-left: 2px solid var(--border-gray);
    }

    .nav-child-item {
      display: flex !important;
      align-items: center !important;
      padding: var(--spacing-sm) var(--spacing-md) !important;
      margin: 2px 0 !important;
      border-radius: var(--radius-sm) !important;
      transition: all 0.3s ease !important;
      text-decoration: none !important;
      color: var(--dark-gray) !important;
      font-size: var(--font-size-xs) !important;
    }

    .nav-child-item:hover {
      background-color: var(--primary-gray) !important;
    }

    .nav-child-item.active {
      background-color: rgba(0, 128, 0, 0.1) !important;
      color: var(--primary-green) !important;
    }

    .nav-child-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: var(--spacing-sm);
      opacity: 0.7;
    }

    .nav-child-label {
      font-weight: 400;
    }

    .nav-divider {
      margin: var(--spacing-md) var(--spacing-lg);
      background-color: var(--border-gray);
    }

    .system-item {
      opacity: 0.8;
    }

    .system-item:hover {
      opacity: 1;
    }

    .sidebar-footer {
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--border-gray);
      background-color: var(--primary-gray);
    }

    .version-info {
      text-align: center;
    }

    .version-label {
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--dark-gray);
    }

    .version-number {
      font-size: var(--font-size-xs);
      color: var(--primary-green);
      font-weight: 400;
    }

    /* Custom Scrollbar for Sidebar */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: var(--border-gray);
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: var(--dark-gray);
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isExpanded = true;

  private authService = inject(AuthService);
  private router = inject(Router);
  private evaluationService = inject(EvaluationService);

  pendingCount: number = 0;

  navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin-dashboard/dashboard',
      permission: 'view_dashboard'
    },
    {
      id: 'evaluations',
      label: 'Evaluation Submissions',
      icon: 'assignment_turned_in',
      route: '/admin-dashboard/evaluations',
      permission: 'approve_submissions'
    },
    {
      id: 'personnel',
      label: 'NSS Personnel',
      icon: 'groups',
      route: '/admin-dashboard/personnel',
      permission: 'manage_personnel',
      children: [
        {
          id: 'personnel-active',
          label: 'Active Personnel',
          icon: 'person',
          route: '/admin-dashboard/active',
          permission: 'manage_personnel'
        },
        {
          id: 'personnel-completed',
          label: 'Completed Service',
          icon: 'check_circle',
          route: '/admin-dashboard/completed',
          permission: 'manage_personnel'
        }
      ]
    },
    {
      id: 'supervisors',
      label: 'Supervisors Management',
      icon: 'supervisor_account',
      route: '/admin-dashboard/supervisors',
      permission: 'manage_supervisors'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: 'analytics',
      route: '/admin-dashboard/reports',
      permission: 'generate_reports'
    },
    {
      id: 'documents',
      label: 'Document Archive',
      icon: 'folder',
      route: '/admin-dashboard/documents',
      permission: 'view_dashboard'
    }
  ];

  systemItems: NavigationItem[] = [
    // {
    //   id: 'settings',
    //   label: 'System Settings',
    //   icon: 'settings',
    //   route: '/admin-dashboard/settings',
    //   permission: 'system_admin'
    // },
    // {
    //   id: 'users',
    //   label: 'User Management',
    //   icon: 'admin_panel_settings',
    //   route: '/admin-dashboard/users',
    //   permission: 'system_admin'
    // },
    {
      id: 'support',
      label: 'Help & Support',
      icon: 'help',
      route: '/admin-dashboard/support',
      permission: 'view_dashboard'
    }
  ];

  hasPermission(permission?: string): boolean {
    return true; // TEMP: Show all links for debugging
  }

  ngOnInit() {
    // Fetch real pending count for admin
    this.evaluationService.getAdminDashboardStats().subscribe({
      next: stats => {
        const evalNav = this.navigationItems.find(item => item.id === 'evaluations');
        if (evalNav) evalNav.badge = stats.pendingReviews || 0;
        this.pendingCount = stats.pendingReviews || 0;
      },
      error: err => {
        // Hide badge on error
        const evalNav = this.navigationItems.find(item => item.id === 'evaluations');
        if (evalNav) evalNav.badge = 0;
        this.pendingCount = 0;
      }
    });
  }
}
