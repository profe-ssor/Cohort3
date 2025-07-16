import { Routes } from '@angular/router';
import { LayoutComponent } from '../../NSS-layout/layout.component';
import { userGuard } from '../../../services/guard/perm.guard';
import { PeronelDashBoardComponent } from '../../peronel-dash-board/peronel-dash-board.component';
import { PdfSignerComponent } from '../../pdf-signer/pdf-signer.component';
import { FooterComponent } from '../../footer/footer.component';
import { ProcessFormComponent } from '../../process-form/process-form.component';
import { NssAssignmentsComponent } from '../../nss-assignments/nss-assignments/nss-assignments.component';
import { MessageCenterComponent } from '../../message-center/message-center.component';
import { ReceivedMessagesComponent } from '../../received-messages/received-messages.component';
import { MessagesComponent } from '../../features/messages/messages.component';
import { SubmitEvaluationComponent } from '../../../pages/submit-evaluation/submit-evaluation.component';
import { ApprovedEvaluationsComponent } from '../../features/personnel/approved-evaluations/approved-evaluations.component';


export const personnelRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [userGuard],
    children: [
      { path: 'persneldashboard', component: PeronelDashBoardComponent },
      { path: 'sign/:id', component: PdfSignerComponent },
      { path: 'footer', component: FooterComponent },
      { path: 'process', component: ProcessFormComponent },
      { path: 'nss-assignment', component: NssAssignmentsComponent },
      { path: 'message', component: MessageCenterComponent },
      { path: 'inbox', component: ReceivedMessagesComponent },
      { path: 'messages', component: MessagesComponent },
      {path: 'evalute', component: SubmitEvaluationComponent},
      {path: 'approved-evaluations', component: ApprovedEvaluationsComponent},
    ]
  }
];
