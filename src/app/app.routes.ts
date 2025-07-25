import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { SignupComponent } from './Components/signup/signup.component';
import { VerifyOtComponent } from './Components/verify-ot/verify-ot.component';
import { ResenOtpComponent } from './Components/resen-otp/resen-otp.component';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { NssDatabaseComponent } from './Components/nss-database/nss-database.component';
import { ReceivedMessagesComponent } from './Components/received-messages/received-messages.component';
import { MessageDetailComponent } from './Components/message-detail/message-detail.component';
import { ChangePasswordComponent } from './Components/change-password/change-password.component';
import { PasswordResetComponent } from './Components/password-reset/password-reset.component';
import { adminGuard, supervisorGuard, userGuard } from './services/guard/perm.guard';

export const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Public routes (no authentication required)
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
    path: 'password-reset',
    component: PasswordResetComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
  {
    path: 'nssdb',
    component: NssDatabaseComponent
  },
  {
    path: 'received-messages',
    component: ReceivedMessagesComponent
  },
  {
    path: 'message-detail/:id',
    component: MessageDetailComponent
  },


  {
    path: 'personnel',
    canActivate: [userGuard],
    loadChildren: () => import('./Components/modules/personnel/personnel.routes').then(m => m.personnelRoutes)
  },

  {
    path: 'admin-dashboard',
    canActivate: [adminGuard],
    loadChildren: () => import('./Components/modules/admin/admin.routes').then(m => m.adminRoutes)
  },
{
  path: 'supervisor-dashboard',
  canActivate: [supervisorGuard],
 loadChildren: () => import('./Components/modules/supervisor/supervisor.routes').then(m => m.supervisorRoutes)

},
{
  path: 'admin/regional-detail/:region',
  canActivate: [adminGuard],
  loadComponent: () => import('./pages/ADMINISTRATORS/regional-detail/regional-detail.component').then(m => m.RegionalDetailComponent)
},

  {
    path: '**',
    component: NotFoundComponent,
  }
];
