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
import { adminGuard, permGuard, supervisorGuard, userGuard } from './services/guard/perm.guard';
import { VerifyOtComponent } from './Components/verify-ot/verify-ot.component';
import { ResenOtpComponent } from './Components/resen-otp/resen-otp.component';
// import { SignatureAdComponent } from './Components/signature-ad/signature-ad.component';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { NssDatabaseComponent } from './Components/nss-database/nss-database.component';
import { ProcessFormComponent } from './Components/process-form/process-form.component';
import { PdfSignerComponent } from './Components/pdf-signer/pdf-signer.component';
import { NssAssignmentsComponent } from './Components/nss-assignments/nss-assignments/nss-assignments.component';
import { MessageCenterComponent } from './Components/message-center/message-center.component';

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
    path: 'nssdb',
    component: NssDatabaseComponent
  },
  // {
  //   path: 'sign-signature',
  //   component: SignatureAdComponent
  // },
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
        path: 'sign/:id',
        component: PdfSignerComponent
      },
      {
        path: 'footer',
        component: FooterComponent
      },
      {
        path: 'process',
        component: ProcessFormComponent
      },
      {
        path: 'nss-assignment',
        component: NssAssignmentsComponent
      },
      {
        path: 'message',
        component: MessageCenterComponent
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
  component: NotFoundComponent,
}
];
