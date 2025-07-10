import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../../../services/admin-services/dashboard.service';
import { RegionalData } from '../../../model/interface/dashboard.models';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-regional-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './regional-detail.component.html',
  styleUrls: ['./regional-detail.component.css']
})
export class RegionalDetailComponent implements OnInit {
  regionName: string = '';
  regionStats: RegionalData | null = null;
  allRegions: RegionalData[] = [];
  loading = true;
  error: string | null = null;

  displayedColumns: string[] = ['region', 'totalPersonnel', 'completedSubmissions', 'pendingSubmissions', 'supervisorCount'];

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.regionName = this.route.snapshot.paramMap.get('region') || '';
    this.dashboardService.getRegionalData().subscribe({
      next: (regions: any[]) => {
        if (this.regionName === 'all') {
          this.allRegions = regions.map(found => ({
            region: found.region,
            totalPersonnel: found.total_personnel,
            pendingSubmissions: found.pending_submissions,
            completedSubmissions: found.completed_submissions,
            supervisorCount: found.supervisor_count
          }));
        } else {
          const found = regions.find(r => r.region === this.regionName);
          if (found) {
            this.regionStats = {
              region: found.region,
              totalPersonnel: found.total_personnel,
              pendingSubmissions: found.pending_submissions,
              completedSubmissions: found.completed_submissions,
              supervisorCount: found.supervisor_count
            };
          } else {
            this.error = 'Region not found.';
          }
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load region details.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin-dashboard/dashboard']);
  }
}
