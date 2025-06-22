import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from "./Components/admin-layout/sidebar/sidebar.component";
import { HeaderComponent } from "./Components/admin-layout/header/header.component";



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    HeaderComponent
],
  template: `
    <div class="app-container">
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar Navigation -->
        <mat-sidenav
          #sidenav
          [mode]="'side'"
          [opened]="sidenavOpened"
          class="app-sidenav"
        >
          <app-sidebar [isExpanded]="sidenavOpened"></app-sidebar>
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="main-content">
          <!-- Header -->
          <app-header (sidebarToggle)="toggleSidebar()"></app-header>

          <!-- Page Content -->
          <main class="page-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      overflow: hidden;
    }

    .sidenav-container {
      height: 100%;
      background-color: var(--primary-gray);
    }

    .app-sidenav {
      width: 280px;
      border-right: 1px solid var(--border-gray);
      background-color: var(--pure-white);
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background-color: var(--primary-gray);
    }

    @media (max-width: 768px) {
      .app-sidenav {
        width: 100%;
        position: fixed !important;
        z-index: 1000;
      }
    }

    .page-content::-webkit-scrollbar {
      width: 6px;
    }

    .page-content::-webkit-scrollbar-track {
      background: var(--primary-gray);
    }

    .page-content::-webkit-scrollbar-thumb {
      background: var(--dark-gray);
      border-radius: 3px;
    }

    .page-content::-webkit-scrollbar-thumb:hover {
      background: var(--soft-black);
    }
  `]
})
export class AppShellComponent {
  sidenavOpened = true;

  toggleSidebar(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }
}
