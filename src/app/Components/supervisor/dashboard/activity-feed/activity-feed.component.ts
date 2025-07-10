import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityFeedService } from '../../../../services/activity-feed.service';
import { ActivityLog } from '../../../../model/interface/activity-log.interface';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.css'

})
export class ActivityFeedComponent implements OnInit {
  activities: ActivityLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private activityFeedService: ActivityFeedService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    this.error = null;

    this.activityFeedService.getRecentActivity().subscribe({
      next: (data) => {
        this.activities = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.error = 'Failed to load recent activities';
        this.loading = false;
      }
    });
  }

  // Method to refresh activities - can be called from parent components
  refreshActivities(): void {
    this.loadActivities();
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'approval':
        return '✅';
      case 'submission':
        return '📝';
      case 'message':
        return '💬';
      case 'personnel':
        return '👥';
      default:
        return '📋';
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }
}
