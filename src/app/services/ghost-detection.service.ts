import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GhostDetectionService {
  public isCheckingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private messageSubject = new BehaviorSubject<string>('');
  private currentStepSubject = new BehaviorSubject<number>(0);

  readonly ghostCheckSteps = [
    'Checking Ghana Card Records...',
    'Verifying University Records...',
    'Cross-referencing NSS Personnel...',
    'Validating Workplace Information...',
    'Finalizing Security Check...'
  ];

  constructor(private http: HttpClient) {}

  get isChecking$(): Observable<boolean> { return this.isCheckingSubject.asObservable(); }
  get progress$(): Observable<number> { return this.progressSubject.asObservable(); }
  get message$(): Observable<string> { return this.messageSubject.asObservable(); }
  get currentStep$(): Observable<number> { return this.currentStepSubject.asObservable(); }

  async runGhostDetection(personnelId: number, token: string | null): Promise<boolean> {
    this.isCheckingSubject.next(true);
    this.progressSubject.next(0);
    this.currentStepSubject.next(0);
    this.messageSubject.next('Starting security verification...');
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    try {
      for (let i = 0; i < this.ghostCheckSteps.length; i++) {
        this.currentStepSubject.next(i);
        this.messageSubject.next(this.ghostCheckSteps[i]);
        this.progressSubject.next(((i + 1) / this.ghostCheckSteps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      const response: any = await this.http.post(
        `${environment.apiUrl}test-ghost-detection/`,
        { personnel_id: personnelId },
        { headers }
      ).toPromise();
      if (response && response.status === 'ghost_detected') {
        this.messageSubject.next('⚠️ Security verification flagged - Administrators notified');
        setTimeout(() => this.reset(), 2000);
        return false;
      } else {
        this.messageSubject.next('✅ Security verification completed successfully');
        setTimeout(() => this.reset(), 2000);
        return true;
      }
    } catch (error) {
      this.messageSubject.next('❌ Security verification failed - Administrators notified');
      setTimeout(() => this.reset(), 2000);
      return false;
    }
  }

  resolveGhostDetection(detectionId: number, resolutionType: string, actionTaken: string, notes: string, token: string | null) {
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;
    return this.http.post(
      `${environment.apiUrl}ghost-resolve/${detectionId}/`,
      {
        resolution_type: resolutionType,
        action_taken: actionTaken,
        notes: notes
      },
      { headers }
    );
  }

  reset() {
    this.isCheckingSubject.next(false);
    this.progressSubject.next(0);
    this.currentStepSubject.next(0);
    this.messageSubject.next('');
  }
}
