import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { SignupComponent } from './Components/signup/signup.component';
import { PeronelDashBoardComponent } from './Components/peronel-dash-board/peronel-dash-board.component';
import { FooterComponent } from './Components/footer/footer.component';
import { DashboardComponent } from './Components/supervisor/dashboard/dashboard.component';
import { HomeComponent } from './Components/supervisor/home/home.component';
import { TablesComponent } from './Components/supervisor/tables/tables.component';
import { AdminComponent } from './Components/admin/admin/admin.component';
import { adminGuard, permGuard, supervisorGuard, userGuard } from './services/perm.guard';
import { VerifyOtComponent } from './Components/verify-ot/verify-ot.component';
import { ResenOtpComponent } from './Components/resen-otp/resen-otp.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'otp-verify',
    component: VerifyOtComponent

  },
  {
    path: 'resend-otp',
    component: ResenOtpComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [userGuard],
    children:[
      {
        path: 'persneldashboard',
        component: PeronelDashBoardComponent,
      },
      {
        path: 'footer',
        component: FooterComponent
      }
    ]
  },
  {
    path: 'supervisor-dashboard',
    component: DashboardComponent,
    canActivate: [supervisorGuard],
    children:[
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'pesonel-table',
        component: TablesComponent
      }
    ]
  },
  {
    path: 'admin-dashboard',
    component: AdminComponent,
    canActivate: [adminGuard],
    children:[

]
},

{
  path: '**',
  redirectTo: 'login' 
}
];
