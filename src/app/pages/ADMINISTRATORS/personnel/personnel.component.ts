import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>NSS Personnel Management</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Personnel management interface will be implemented here.</p>
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
export class PersonnelComponent {}