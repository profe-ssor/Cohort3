import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NssPersonelService } from '../../../services/nss_personel.service';

@Component({
  selector: 'app-personnel',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-personnel-container">
      <div class="admin-personnel-header">
        <div>
          <h1 class="admin-title">NSS Personnel Management</h1>
          <p class="admin-subtitle">Search, filter, and manage all assigned National Service personnel</p>
        </div>
        <div class="admin-personnel-actions">
          <input class="search-bar" type="text" placeholder="Search personnel..." [(ngModel)]="searchQuery" />
          <div class="view-toggle-group">
            <button class="toggle-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
              <span class="material-icons">grid_view</span> Grid
            </button>
            <button class="toggle-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
              <span class="material-icons">view_list</span> List
            </button>
          </div>
        </div>
      </div>
      <div class="filter-chips">
        <span class="chip" [class.selected]="selectedStatus === ''" (click)="setStatus('')">All Status</span>
        <span class="chip" [class.selected]="selectedStatus === 'active'" (click)="setStatus('active')">Active</span>
        <span class="chip" [class.selected]="selectedStatus === 'completed'" (click)="setStatus('completed')">Completed</span>
        <span class="chip" [class.selected]="selectedStatus === 'on_leave'" (click)="setStatus('on_leave')">On Leave</span>
        <span class="chip" [class.selected]="selectedStatus === 'inactive'" (click)="setStatus('inactive')">Inactive</span>
        <!-- Add more chips for department/performance as needed -->
      </div>
      <div *ngIf="loading" class="loading">Loading personnel...</div>
      <div *ngIf="!loading && filteredPersonnel.length === 0" class="empty">No personnel found.</div>
      <div *ngIf="!loading && filteredPersonnel.length > 0">
        <div *ngIf="viewMode === 'grid'" class="personnel-grid">
          <div class="personnel-card" *ngFor="let person of filteredPersonnel">
            <div class="avatar">
              <img *ngIf="person.avatar" [src]="person.avatar" alt="Avatar" />
              <span *ngIf="!person.avatar">{{ person.name.charAt(0) }}</span>
            </div>
            <div class="personnel-info">
              <h3>{{ person.name }}</h3>
              <p class="email">{{ person.email }}</p>
              <div class="meta-row">
                <span class="meta-label">Region:</span> <span>{{ person.region || 'N/A' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Department:</span> <span>{{ person.department || 'N/A' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Status:</span> <span class="status-badge" [class]="'status-' + person.status">{{ (person.status || 'N/A') | titlecase }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Performance:</span> <span class="performance-badge" [class]="'performance-' + person.performance">{{ (person.performance || 'N/A') | titlecase }}</span>
              </div>
              <div class="stats-row">
                <span><i class="material-icons">assignment_turned_in</i> {{ person.totalSubmissions ?? 0 }} Submissions</span>
                <span><i class="material-icons">hourglass_empty</i> {{ person.pendingSubmissions ?? 0 }} Pending</span>
                <span><i class="material-icons">check_circle</i> {{ person.approvedSubmissions ?? 0 }} Approved</span>
              </div>
            </div>
            <div class="personnel-actions">
              <a class="btn btn-outline" [routerLink]="['/admin-dashboard/personnel', person.id || person.nss_id]">View Details</a>
              <button class="btn btn-secondary">Message</button>
            </div>
          </div>
        </div>
        <table *ngIf="viewMode === 'list'" class="personnel-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Region</th>
              <th>Department</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Submissions</th>
              <th>Pending</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let person of filteredPersonnel">
              <td>{{ person.name }}</td>
              <td>{{ person.email }}</td>
              <td>{{ person.region }}</td>
              <td>{{ person.department }}</td>
              <td><span class="status-badge" [class]="'status-' + person.status">{{ person.status | titlecase }}</span></td>
              <td><span class="performance-badge" [class]="'performance-' + person.performance">{{ person.performance | titlecase }}</span></td>
              <td>{{ person.totalSubmissions }}</td>
              <td>{{ person.pendingSubmissions }}</td>
              <td>{{ person.approvedSubmissions }}</td>
              <td>
                <div class="table-actions">
                  <a class="btn btn-outline" [routerLink]="['/admin-dashboard/personnel', person.id || person.nss_id]">View</a>
                  <button class="btn btn-secondary">Message</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-personnel-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .admin-personnel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 2rem;
    }
    .admin-title {
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0;
      color: #222;
    }
    .admin-subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0.5rem 0 0 0;
    }
    .admin-personnel-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .search-bar {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 1rem;
      min-width: 220px;
      outline: none;
      transition: border 0.2s;
    }
    .search-bar:focus {
      border: 1.5px solid #1976d2;
    }
    .btn {
      padding: 0.5rem 1.2rem;
      border-radius: 6px;
      border: none;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .btn-primary {
      background: #1976d2;
      color: #fff;
    }
    .btn-outline {
      background: #fff;
      color: #1976d2;
      border: 1.5px solid #1976d2;
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #333;
      border: 1px solid #ccc;
    }
    .filter-chips {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .chip {
      padding: 0.4rem 1.1rem;
      border-radius: 16px;
      background: #f0f0f0;
      color: #333;
      font-size: 0.98rem;
      cursor: pointer;
      border: 1px solid #e0e0e0;
      transition: background 0.2s, color 0.2s;
    }
    .chip.selected, .chip:hover {
      background: #1976d2;
      color: #fff;
      border: 1px solid #1976d2;
    }
    .personnel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }
    .personnel-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
      padding: 1.5rem 1.2rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      position: relative;
      transition: box-shadow 0.2s;
    }
    .personnel-card:hover {
      box-shadow: 0 8px 32px rgba(25, 118, 210, 0.13);
    }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #e3eafc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 0.5rem;
      overflow: hidden;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .personnel-info h3 {
      margin: 0 0 0.2rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #222;
    }
    .personnel-info .email {
      font-size: 0.98rem;
      color: #1976d2;
      margin-bottom: 0.5rem;
    }
    .meta-row {
      font-size: 1.08rem;
      color: #333;
      margin-bottom: 0.35rem;
      display: flex;
      gap: 0.5rem;
      font-weight: 500;
    }
    .meta-label {
      font-weight: 600;
      color: #1976d2;
      min-width: 90px;
    }
    .status-badge {
      padding: 0.2rem 0.7rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      background: #e3eafc;
      color: #1976d2;
      margin-left: 0.5rem;
    }
    .status-active { background: #e8f5e9; color: #388e3c; }
    .status-completed { background: #e0e0e0; color: #616161; }
    .status-on_leave { background: #fffde7; color: #fbc02d; }
    .status-inactive { background: #ffebee; color: #c62828; }
    .performance-badge {
      padding: 0.2rem 0.7rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      background: #f0f4c3;
      color: #827717;
      margin-left: 0.5rem;
    }
    .performance-excellent { background: #e8f5e9; color: #388e3c; }
    .performance-good { background: #e3f2fd; color: #1976d2; }
    .performance-satisfactory { background: #fffde7; color: #fbc02d; }
    .performance-needs_improvement { background: #ffebee; color: #c62828; }
    .stats-row {
      display: flex;
      gap: 1.5rem;
      font-size: 1.08rem;
      color: #1976d2;
      margin-top: 0.7rem;
      background: #f0f4fa;
      border-radius: 8px;
      padding: 0.5rem 0.7rem;
      font-weight: 500;
    }
    .stats-row i.material-icons {
      font-size: 1.2rem;
      vertical-align: middle;
      margin-right: 0.2rem;
      color: #1976d2;
    }
    .personnel-actions {
      display: flex;
      gap: 0.7rem;
      margin-top: 0.7rem;
    }
    .personnel-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      overflow: hidden;
    }
    .personnel-table th, .personnel-table td {
      padding: 0.8rem 1rem;
      text-align: left;
      font-size: 1rem;
    }
    .personnel-table th {
      background: #f5f5f5;
      color: #1976d2;
      font-weight: 600;
    }
    .personnel-table tr:nth-child(even) {
      background: #fafbfc;
    }
    .personnel-table .status-badge, .personnel-table .performance-badge {
      margin-left: 0;
    }
    .loading, .empty {
      text-align: center;
      color: #888;
      margin: 2rem 0;
      font-size: 1.2rem;
    }
    .view-toggle-group {
      display: flex;
      border-radius: 8px;
      background: #f0f0f0;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(25, 118, 210, 0.04);
    }
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: none;
      border: none;
      padding: 0.5rem 1.1rem;
      font-size: 1rem;
      color: #1976d2;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .toggle-btn.active, .toggle-btn:hover {
      background: #1976d2;
      color: #fff;
    }
    .toggle-btn .material-icons {
      font-size: 1.2rem;
    }
    .table-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
    }
    @media (max-width: 700px) {
      .admin-personnel-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .personnel-grid { grid-template-columns: 1fr; }
    }
    /* Reminder: Ensure Material Icons are loaded in index.html:
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    */
  `]
})
export class PersonnelComponent implements OnInit {
  searchQuery = '';
  selectedStatus = '';
  viewMode: 'grid' | 'list' = 'grid';
  personnel: any[] = [];
  loading = true;

  get filteredPersonnel() {
    let filtered = this.personnel;
    if (this.selectedStatus) filtered = filtered.filter(p => p.status === this.selectedStatus);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.department || '').toLowerCase().includes(q) ||
        (p.region || '').toLowerCase().includes(q) ||
        (p.position || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  constructor(private nssPersonnelService: NssPersonelService) {}

  ngOnInit() {
    this.nssPersonnelService.getAssignedPersonnel().subscribe({
      next: (data) => {
        this.personnel = data.map(person => ({
          ...person,
          name: person.full_name || person.name,
          region: person.region_name || person.region || 'N/A',
          totalSubmissions: 0,
          pendingSubmissions: 0,
          approvedSubmissions: 0,
        }));
        this.loading = false;

        // Fetch accurate counts for each person
        this.personnel.forEach((person, idx) => {
          this.nssPersonnelService.getRecentSubmissions(person.id).subscribe(submissions => {
            this.personnel[idx].totalSubmissions = submissions.length;
            this.personnel[idx].pendingSubmissions = submissions.filter((s: any) => s.status === 'pending').length;
            this.personnel[idx].approvedSubmissions = submissions.filter((s: any) => s.status === 'approved').length;
          });
        });
      },
      error: () => {
        this.personnel = [];
        this.loading = false;
      }
    });
  }

  setStatus(status: string) {
    this.selectedStatus = status;
  }

  toggleView() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
}
