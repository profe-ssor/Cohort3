import { Component, OnInit } from '@angular/core';
import { NssPersonelService } from '../../../services/nss_personel.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css'
})
export class TablesComponent implements OnInit {
  assignedPersonnel: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private nssPersonelService: NssPersonelService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.nssPersonelService.getAssignedPersonnel().subscribe({
      next: (data) => {
        this.assignedPersonnel = data;
      },
      error: (err) => {
        this.error = 'Failed to load assigned personnel';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
