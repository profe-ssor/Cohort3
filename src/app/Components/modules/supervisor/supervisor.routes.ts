

import { Routes } from '@angular/router';
import { LayoutComponent } from '../../../pages/SUPERVISORS/layout/layout/layout.component';




export const supervisorRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../../Components/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'evaluations',
        loadComponent: () => import('../../../Components/features/evaluations/evaluations.component').then(m => m.EvaluationsComponent)
      },
     {
        path: 'personnel',
        loadComponent: () => import('../../../Components/features/personnel/personnel.component').then(m => m.PersonnelComponent)
      },
      {
        path: 'personnel/:id',
        loadComponent: () => import('../../../Components/features/personnel/personnel-detail/personnel-detail.component').then(m => m.PersonnelDetailComponent)
      },
       {
        path: 'messages',
        loadComponent: () => import('../../../Components/features/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('../../profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];

