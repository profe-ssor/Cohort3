import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface GhostDetection {
  id: number;
  nss_personnel_name: string;
  supervisor_name: string;
  assigned_admin_name: string;
  personnel_ghana_card: string;
  personnel_nss_id: string;
  personnel_region: string;
  personnel_department: string;
  detection_flags: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive' | 'disciplinary_action';
  submission_attempt: boolean;
  timestamp: string;
  resolved_at: string | null;
  resolution_notes: string;
  admin_action_taken: string;
}

interface GhostStatistics {
  total_detections: number;
  pending_count: number;
  investigating_count: number;
  resolved_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ghost-detection-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <i class="fas fa-ghost"></i>
          Ghost Personnel Detection Dashboard
        </h1>
        <p class="dashboard-subtitle">Monitor and manage potential ghost personnel across the system</p>

        <!-- Recent Activity Notifications -->
        <div class="recent-activity" *ngIf="recentNotifications.length > 0">
          <h3 class="activity-title">
            <i class="fas fa-bell"></i>
            Recent Security Activities
          </h3>
          <div class="activity-list">
            <div *ngFor="let notification of recentNotifications" class="activity-item" [class]="'activity-' + notification.type">
              <div class="activity-icon">
                <i *ngIf="notification.type === 'ghost'" class="fas fa-exclamation-triangle"></i>
                <i *ngIf="notification.type === 'success'" class="fas fa-check-circle"></i>
                <i *ngIf="notification.type === 'error'" class="fas fa-times-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ notification.title }}</div>
                <div class="activity-message">{{ notification.message }}</div>
                <div class="activity-time">{{ notification.timestamp | date:'short' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="statistics-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.total_detections }}</h3>
            <p class="stat-label">Total Detections</p>
          </div>
        </div>

        <div class="stat-card critical">
          <div class="stat-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.critical_count }}</h3>
            <p class="stat-label">Critical Alerts</p>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.pending_count }}</h3>
            <p class="stat-label">Pending Review</p>
          </div>
        </div>

        <div class="stat-card investigating">
          <div class="stat-icon">
            <i class="fas fa-search"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.investigating_count }}</h3>
            <p class="stat-label">Under Investigation</p>
          </div>
        </div>

        <div class="stat-card resolved">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.resolved_count }}</h3>
            <p class="stat-label">Resolved</p>
          </div>
        </div>

        <div class="stat-card high">
          <div class="stat-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ statistics.high_count }}</h3>
            <p class="stat-label">High Risk</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label class="filter-label">Status Filter:</label>
          <select [(ngModel)]="statusFilter" (change)="loadDetections()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="investigating">Under Investigation</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
            <option value="disciplinary_action">Disciplinary Action</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Severity Filter:</label>
          <select [(ngModel)]="severityFilter" (change)="loadDetections()" class="filter-select">
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button class="refresh-btn" (click)="loadDetections()">
          <i class="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      <!-- Detections Table -->
      <div class="detections-table-container">
        <div class="table-header">
          <h2 class="table-title">Ghost Detection Records</h2>
          <div class="table-actions">
            <button class="btn btn-primary" (click)="exportData()">
              <i class="fas fa-download"></i>
              Export Data
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="detections-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Ghana Card</th>
                <th>NSS ID</th>
                <th>Region</th>
                <th>Supervisor</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Detection Flags</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let detection of detections" [class]="'severity-' + detection.severity">
                <td class="personnel-cell">
                  <div class="personnel-info">
                    <strong>{{ detection.nss_personnel_name }}</strong>
                    <span class="department">{{ detection.personnel_department }}</span>
                  </div>
                </td>
                <td>{{ detection.personnel_ghana_card }}</td>
                <td>{{ detection.personnel_nss_id }}</td>
                <td>{{ detection.personnel_region }}</td>
                <td>{{ detection.supervisor_name }}</td>
                <td>
                  <span class="severity-badge" [class]="'severity-' + detection.severity">
                    {{ detection.severity | titlecase }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class]="'status-' + detection.status">
                    {{ detection.status | titlecase }}
                  </span>
                </td>
                <td class="flags-cell">
                  <div class="flags-list">
                    <span *ngFor="let flag of detection.detection_flags" class="flag-item">
                      {{ flag }}
                    </span>
                  </div>
                </td>
                <td>{{ detection.timestamp | date:'short' }}</td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button
                      *ngIf="detection.status === 'pending'"
                      class="btn btn-sm btn-warning"
                      (click)="startInvestigation(detection.id)"
                      [disabled]="loading">
                      <i class="fas fa-search"></i>
                      Investigate
                    </button>
                    <button
                      *ngIf="detection.status === 'investigating'"
                      class="btn btn-sm btn-success"
                      (click)="resolveDetection(detection.id)"
                      [disabled]="loading">
                      <i class="fas fa-check"></i>
                      Resolve
                    </button>
                    <button
                      class="btn btn-sm btn-info"
                      (click)="viewDetails(detection)"
                      [disabled]="loading">
                      <i class="fas fa-eye"></i>
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-overlay">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading ghost detections...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && detections.length === 0" class="empty-state">
          <i class="fas fa-ghost"></i>
          <h3>No Ghost Detections Found</h3>
          <p>All personnel appear to be legitimate at this time.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ghost-detection-dashboard {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .dashboard-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .dashboard-title i {
      font-size: 36px;
      color: #ff6b6b;
    }

    .dashboard-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }

    .recent-activity {
      background: white;
      border-radius: 15px;
      padding: 20px;
      margin-top: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      /* Add max height and scroll */
      max-height: 350px;
      overflow-y: auto;
    }

    .activity-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .activity-title i {
      font-size: 24px;
      color: #ff6b6b;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border-radius: 10px;
      background: #f8f9fa;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .activity-item.activity-ghost {
      border-left: 5px solid #ff6b6b;
    }

    .activity-item.activity-success {
      border-left: 5px solid #4caf50;
    }

    .activity-item.activity-error {
      border-left: 5px solid #f44336;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      background: #ffebee;
      color: #ff6b6b;
    }

    .activity-item.activity-success .activity-icon {
      background: #e8f5e9;
      color: #4caf50;
    }

    .activity-item.activity-error .activity-icon {
      background: #ffebee;
      color: #f44336;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }

    .activity-message {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card.total {
      border-left: 5px solid #4facfe;
    }

    .stat-card.critical {
      border-left: 5px solid #ff6b6b;
    }

    .stat-card.pending {
      border-left: 5px solid #ffa726;
    }

    .stat-card.investigating {
      border-left: 5px solid #42a5f5;
    }

    .stat-card.resolved {
      border-left: 5px solid #66bb6a;
    }

    .stat-card.high {
      border-left: 5px solid #ef5350;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .stat-card.total .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .stat-card.critical .stat-icon {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
    }

    .stat-card.pending .stat-icon {
      background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
      color: white;
    }

    .stat-card.investigating .stat-icon {
      background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
      color: white;
    }

    .stat-card.resolved .stat-icon {
      background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
      color: white;
    }

    .stat-card.high .stat-icon {
      background: linear-gradient(135deg, #ef5350 0%, #f44336 100%);
      color: white;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 5px 0;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin: 0;
    }

    .filters-section {
      background: white;
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .filter-select {
      padding: 10px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #4facfe;
    }

    .refresh-btn {
      padding: 10px 20px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.3s ease;
    }

    .refresh-btn:hover {
      transform: translateY(-2px);
    }

    .detections-table-container {
      background: white;
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffa726 0%, #ff9800 100%);
      color: white;
    }

    .btn-success {
      background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
      color: white;
    }

    .btn-info {
      background: linear-gradient(135deg, #42a5f5 0%, #2196f3 100%);
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .table-wrapper {
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }

    .detections-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .detections-table th {
      background: #f8f9fa;
      padding: 15px 10px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #e0e0e0;
    }

    .detections-table td {
      padding: 15px 10px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
    }

    .detections-table tr:hover {
      background: #f8f9fa;
    }

    .personnel-cell {
      min-width: 200px;
    }

    .personnel-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .department {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }

    .severity-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-critical {
      background: #ffebee;
      color: #c62828;
    }

    .severity-high {
      background: #fff3e0;
      color: #ef6c00;
    }

    .severity-medium {
      background: #e3f2fd;
      color: #1565c0;
    }

    .severity-low {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fff3e0;
      color: #ef6c00;
    }

    .status-investigating {
      background: #e3f2fd;
      color: #1565c0;
    }

    .status-resolved {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-false_positive {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .status-disciplinary_action {
      background: #ffebee;
      color: #c62828;
    }

    .flags-cell {
      max-width: 300px;
    }

    .flags-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .flag-item {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: #666;
    }

    .actions-cell {
      min-width: 150px;
    }

    .action-buttons {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
    }

    .loading-spinner {
      text-align: center;
      color: #4facfe;
    }

    .loading-spinner i {
      font-size: 40px;
      margin-bottom: 15px;
    }

    .loading-spinner p {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state i {
      font-size: 60px;
      color: #ddd;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .statistics-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .filters-section {
        flex-direction: column;
        align-items: stretch;
      }

      .table-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .detections-table {
        font-size: 12px;
      }

      .detections-table th,
      .detections-table td {
        padding: 10px 5px;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  detections: GhostDetection[] = [];
  statistics: GhostStatistics = {
    total_detections: 0,
    pending_count: 0,
    investigating_count: 0,
    resolved_count: 0,
    critical_count: 0,
    high_count: 0,
    medium_count: 0,
    low_count: 0
  };

  statusFilter = '';
  severityFilter = '';
  loading = false;

  recentNotifications: any[] = []; // Placeholder for notifications

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDetections();
    this.loadRecentNotifications(); // Load notifications on init
  }

  loadDetections() {
    this.loading = true;
    console.log('🔄 Loading ghost detections...');

    let url = `${environment.API_URL}ghost-dashboard/`;
    const params: string[] = [];

    if (this.statusFilter) {
      params.push(`status=${this.statusFilter}`);
    }

    if (this.severityFilter) {
      params.push(`severity=${this.severityFilter}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    console.log('🌐 API URL:', url);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    console.log('🔑 Auth token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        console.log('✅ API Response:', response);
        this.detections = response.detections;
        this.statistics = response.statistics;
        console.log('📊 Detections loaded:', this.detections.length);
        console.log('📈 Statistics:', this.statistics);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading ghost detections:', error);
        console.error('❌ Error details:', error.error);
        this.loading = false;
      }
    });
  }

  startInvestigation(detectionId: number) {
    this.loading = true;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });

    this.http.post<any>(`${environment.API_URL}ghost-investigate/${detectionId}/`, {}, { headers }).subscribe({
      next: (response) => {
        this.loadDetections(); // Refresh the data
        this.addNotification('Ghost Detection', 'Investigation initiated for a potential ghost personnel.', 'ghost');
      },
      error: (error) => {
        console.error('Error starting investigation:', error);
        this.loading = false;
      }
    });
  }

  resolveDetection(detectionId: number) {
    // This would open a dialog to collect resolution details
    // For now, we'll just show an alert
    alert('Resolution dialog would open here to collect action taken and notes');
  }

  viewDetails(detection: GhostDetection) {
    // This would open a detailed view dialog
    alert(`Viewing details for ${detection.nss_personnel_name}`);
  }

  exportData() {
    // This would export the data to CSV/Excel
    alert('Export functionality would be implemented here');
  }

  private addNotification(title: string, message: string, type: 'ghost' | 'success' | 'error') {
    this.recentNotifications.unshift({
      title,
      message,
      type,
      timestamp: new Date()
    });
    // Keep only the last 10 notifications
    if (this.recentNotifications.length > 10) {
      this.recentNotifications.pop();
    }
  }

  private loadRecentNotifications() {
    // In a real application, you would fetch these from an API endpoint
    // For now, we'll simulate some data
    this.recentNotifications = [
      { title: 'New Ghost Detection', message: 'A potential ghost personnel detected in Region A.', type: 'ghost', timestamp: new Date('2023-10-27T10:00:00') },
      { title: 'Investigation Complete', message: 'Ghost personnel in Region B resolved.', type: 'success', timestamp: new Date('2023-10-26T14:30:00') },
      { title: 'Alert Triggered', message: 'Critical alert for personnel in Region C.', type: 'ghost', timestamp: new Date('2023-10-25T09:15:00') },
      { title: 'System Update', message: 'Security system updated and optimized.', type: 'success', timestamp: new Date('2023-10-24T16:00:00') },
      { title: 'Error Detected', message: 'An error in the authentication module has been resolved.', type: 'success', timestamp: new Date('2023-10-23T11:00:00') },
      { title: 'New User Added', message: 'A new administrator has been added to the system.', type: 'success', timestamp: new Date('2023-10-22T10:00:00') },
      { title: 'System Maintenance', message: 'Scheduled maintenance on the security infrastructure.', type: 'ghost', timestamp: new Date('2023-10-21T15:00:00') },
      { title: 'Alert Cleared', message: 'All critical alerts have been resolved.', type: 'success', timestamp: new Date('2023-10-20T12:00:00') },
      { title: 'New Report Generated', message: 'A comprehensive security report has been generated.', type: 'success', timestamp: new Date('2023-10-19T10:00:00') },
      { title: 'System Upgrade', message: 'Security system upgraded to version 2.0.', type: 'success', timestamp: new Date('2023-10-18T14:00:00') }
    ];
  }
}
