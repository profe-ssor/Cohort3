import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLog } from '../model/interface/activity-log.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityFeedService {
  private apiUrl = `${environment.apiUrl}/nss_supervisor/recent-activity/`;

  constructor(private http: HttpClient) {}

  getRecentActivity(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(this.apiUrl);
  }
}
