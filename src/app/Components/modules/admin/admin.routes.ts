import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../../pages/ADMINISTRATORS/admin-layout/admin-layout.component';


export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'evaluations',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/evaluations/evaluations.component').then(m => m.AdminEvaluationsPageComponent),
      },
      {
        path: 'personnel',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/personnel/personnel.component').then(m => m.PersonnelComponent),
      },
      {
        path: 'personnel/:id',
        loadComponent: () =>
          import('../../../Components/features/personnel/personnel-detail/personnel-detail.component').then(m => m.PersonnelDetailComponent),
      },
      {
        path: 'completed',
        loadComponent: () => import('../../../Components/features/personnel/completed-personnel.component').then(m => m.CompletedPersonnelComponent),
      },
      {
        path: 'supervisors',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/supervisors/supervisors.component').then(m => m.SupervisorsComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/reports/reports.component').then(m => m.ReportsComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../../../pages/ADMINISTRATORS/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('../../profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
