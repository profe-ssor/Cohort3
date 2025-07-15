import { CompletedPersonnelComponent } from './completed-personnel.component';
import { Routes } from '@angular/router';

const routes: Routes = [
  { path: 'completed', component: CompletedPersonnelComponent },
];

export const PersonnelRoutingModule = RouterModule.forChild(routes);
