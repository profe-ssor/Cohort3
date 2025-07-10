import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../../services/auth.service';
import { SupervisorService } from '../../../../services/supervisors';
import { SupervisorCount } from '../../../../model/interface/supervor';
import { MessageService } from '../../../../services/message.service';
import { IMessageStats } from '../../../../model/interface/message';
import { EvaluationService } from '../../../../services/evaluation.service';
import { NssPersonelService } from '../../../../services/nss_personel.service';
import { interval, Subscription } from 'rxjs';

interface NavigationItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  subItems?: NavigationItem[];
}

@Component({
  selector: 'app-supervisor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = signal(false);
  currentNssCount = 0;
  unreadMessages = signal<number>(0);
  pendingEvaluations = signal(0);
  pendingPersonnelReviews = signal(0);

  loading = true;
  countError: string | null = null;
  private refreshSubscription?: Subscription;

  navigationItems: NavigationItem[] = [
    { label: 'Dashboard', route: '/supervisor-dashboard/dashboard', icon: 'dashboard' },
    { label: 'Evaluation Submissions', route: '/supervisor-dashboard/evaluations', icon: 'evaluations', badge: 0 },
    { label: 'NSS Personnel', route: '/supervisor-dashboard/personnel', icon: 'personnel', badge: 0 },
    { label: 'Message Center', route: '/supervisor-dashboard/messages', icon: 'messages', badge: 0 }
  ];

  private readonly icons: Record<string, string> = {
    dashboard: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4M16 5v4"></path>
    </svg>`,
    evaluations: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>`,
    personnel: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857
        M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857
        m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0
        2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
    </svg>`,
    messages: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8
        a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042
        3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
    </svg>`
  };

  constructor(
    private authService: AuthService,
    private supervisorService: SupervisorService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private evaluationService: EvaluationService,
    private nssPersonnelService: NssPersonelService,
  ) {}

  ngOnInit(): void {
    this.loadAllCounts();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private startAutoRefresh(): void {
    // Refresh counts every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadAllCounts();
    });
  }

  private loadAllCounts(): void {
    this.getAssignedPersonnel();
    this.getUnreadMessages();
    this.getPendingEvaluations();
    this.getPendingPersonnelReviews();
  }

  // Public method to manually refresh all counts
  refreshCounts(): void {
    this.loadAllCounts();
  }

  toggleSidebar() {
    this.isCollapsed.update(value => !value);
  }

  getIcon(iconName: string): SafeHtml {
    const svg = this.icons[iconName];
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getUnreadMessages(): void {
    this.messageService.getMessageStats().subscribe({
      next: (res: IMessageStats) => {
        this.unreadMessages.set(res.unread_messages);
        this.updateNavigationBadge('Message Center', res.unread_messages);
      },
      error: () => {
        console.error('Failed to load unread messages.');
      }
    });
  }

  getPendingEvaluations(): void {
    this.evaluationService.getDashboardStats().subscribe({
      next: stats => {
        console.log('Dashboard stats received:', stats);
        this.pendingEvaluations.set(stats.total_pending);
        this.updateNavigationBadge('Evaluation Submissions', stats.total_pending);
      },
      error: err => {
        console.error('Failed to load pending evaluations:', err);
      }
    });
  }

  getPendingPersonnelReviews(): void {
    // Use the NSS personnel service to get pending submissions count
    this.nssPersonnelService.getPendingSubmissions().subscribe({
      next: count => {
        console.log('Pending personnel submissions count:', count);
        this.pendingPersonnelReviews.set(count);
        this.updateNavigationBadge('NSS Personnel', count);
      },
      error: err => {
        console.error('Failed to load pending personnel reviews:', err);
        // Fallback to dashboard stats if personnel endpoint fails
        this.evaluationService.getDashboardStats().subscribe({
          next: stats => {
            console.log('Fallback dashboard stats for personnel:', stats);
            this.pendingPersonnelReviews.set(stats.total_pending);
            this.updateNavigationBadge('NSS Personnel', stats.total_pending);
          },
          error: fallbackErr => {
            console.error('Failed to load pending personnel reviews (fallback):', fallbackErr);
            this.pendingPersonnelReviews.set(0);
            this.updateNavigationBadge('NSS Personnel', 0);
          }
        });
      }
    });
  }

  private updateNavigationBadge(label: string, count: number): void {
    const navItem = this.navigationItems.find(n => n.label === label);
    if (navItem) {
      navItem.badge = count > 0 ? count : undefined;
    }
  }

  getAssignedPersonnel(): void {
    this.loading = true;
    this.countError = null;

    this.supervisorService.getSupervisorCounts().subscribe({
      next: (data) => {
        console.log('Supervisor counts data:', data);
        const currentUser = this.authService.getUser();
        console.log('Current user:', currentUser);
        const userId = currentUser?.id ?? currentUser?.supervisor_id ?? currentUser?.user_id;
        console.log('Looking for supervisor ID:', userId);
        const match = data.find(item => item.supervisor_id == userId);
        console.log('Matched supervisor data:', match);
        this.currentNssCount = match?.nss_count ?? data[0]?.nss_count ?? 0;
        console.log('Final NSS count:', this.currentNssCount);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading personnel count:', err);
        this.countError = 'Failed to load personnel count';
        this.loading = false;
      }
    });
  }
}
