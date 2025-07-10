import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationsComponent } from '../../../Components/features/evaluations/evaluations.component';

@Component({
  selector: 'app-admin-evaluations-page',
  standalone: true,
  imports: [CommonModule, EvaluationsComponent],
  template: `<app-evaluations mode="admin"></app-evaluations>`
})
export class AdminEvaluationsPageComponent {}
