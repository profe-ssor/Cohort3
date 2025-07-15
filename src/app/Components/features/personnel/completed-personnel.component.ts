import { Component, OnInit } from '@angular/core';
import { NssPersonelService } from '../../../services/nss_personel.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-completed-personnel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './completed-personnel.component.html',
  styleUrls: ['./completed-personnel.component.css']
})
export class CompletedPersonnelComponent implements OnInit {
  archivedPersonnel: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private nssService: NssPersonelService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchArchivedPersonnel();
  }

  fetchArchivedPersonnel() {
    this.loading = true;
    this.nssService.getArchivedPersonnel().subscribe({
      next: (data) => {
        this.archivedPersonnel = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load archived personnel', 'Close', { duration: 3000 });
      }
    });
  }

  restorePersonnel(id: number) {
    this.nssService.restoreArchivedPersonnel(id).subscribe({
      next: () => {
        this.snackBar.open('Personnel restored successfully', 'Close', { duration: 3000 });
        this.fetchArchivedPersonnel();
      },
      error: () => {
        this.snackBar.open('Failed to restore personnel', 'Close', { duration: 3000 });
      }
    });
  }

  get filteredPersonnel() {
    if (!this.searchTerm) return this.archivedPersonnel;
    return this.archivedPersonnel.filter(p =>
      p.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.ghana_card_record.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.nss_id.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
