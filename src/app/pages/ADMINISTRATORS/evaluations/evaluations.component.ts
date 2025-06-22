import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Evaluation Submissions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Evaluation submissions management will be implemented here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: var(--spacing-lg);
    }
  `]
})
export class EvaluationsComponent {}