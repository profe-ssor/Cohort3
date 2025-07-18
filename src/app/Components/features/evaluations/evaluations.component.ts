import { CommonModule } from '@angular/common';
import { Component, signal, computed, OnInit, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import {
  Evaluation,
  EvaluationDashboardStats,
  EvaluationListResponse,
  EvaluationPriority,
  EvaluationStatus,
  EvaluationStatusUpdate,
  EvaluationType
} from '../../../model/interface/evaluation';
import { PDF } from '../../../model/interface/pdf';
import { PdfService } from '../../../services/pdf.service';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/admin-services/dashboard.service';
import { EvaluationsComponent as SupervisorEvaluationsComponent } from '../../../Components/features/evaluations/evaluations.component';
import { DashboardStats } from '../../../model/interface/dashboard.models';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-evaluations-page',
  standalone: true,
  imports: [CommonModule, SupervisorEvaluationsComponent],
  template: `<app-evaluations mode="admin"></app-evaluations>`
})
export class AdminEvaluationsPageComponent {}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.css'
})
export class EvaluationsComponent implements OnInit {
  @Input() mode: 'admin'  | 'supervisor' = 'supervisor';
  private evaluationService = inject(EvaluationService);
  private pdfService = inject(PdfService);
  private toast = inject(ToastrService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  selectedStatus = signal<string>('');
  selectedType = signal<string>('');
  selectedPriority = signal<string>('');
  searchQuery = signal<string>('');
  showFormsOnly = signal<boolean>(false);

  evaluations = signal<Evaluation[]>([]);
  evaluationForms = signal<PDF[]>([]);
  selectedEvaluationIds = signal<number[]>([]);

  dashboardStats = signal<DashboardStats>({
    totalSubmissions: 0,
    pendingReviews: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalPersonnel: 0,
    activeSupervisors: 0
  });

  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(50);

  pdfViewerOpen = signal<boolean>(false);
  pdfViewerUrl = signal<SafeResourceUrl>('');

  // Static status and priority types for filters
  statusTypes = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];
  priorityTypes = [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  ngOnInit() {
    if (this.mode === 'admin') {
      this.loadAdminDashboardStats();
      this.loadEvaluations();
    } else {
      this.loadDashboardStats();
      this.loadEvaluations();
    }
  }

  private convertPdfToEvaluation(pdf: PDF): Evaluation {
    return {
      id: pdf.id,
      title: pdf.file_name || 'Untitled PDF',
      description: `${pdf.form_type} evaluation form`,
      evaluation_type: pdf.form_type?.toLowerCase() as EvaluationType || 'monthly',
      priority: pdf.priority as EvaluationPriority || 'medium',
      status: pdf.status as EvaluationStatus || 'pending',
      file: pdf.file,
      signed_pdf: pdf.signed_file,
      created_at: pdf.uploaded_at || pdf.submitted_date || '',
      updated_at: pdf.uploaded_at || pdf.submitted_date || '',
      due_date: pdf.due_date || '',
      supervisor_comments: '',
      is_overdue: pdf.due_date ? new Date(pdf.due_date) < new Date() : false,
      completed_today: false,
      nss_personnel_name: pdf.sender_name || '',
      supervisor_name: pdf.receiver_name || '',
      nss_personnel_email: ''
    };
  }

  allEvaluations = computed(() => {
    const regular = this.evaluations() || [];
    const forms = (this.evaluationForms() || []).map(f => this.convertPdfToEvaluation(f));
    return this.showFormsOnly() ? forms : [...regular, ...forms];
  });

  filteredEvaluations = computed(() => {
    let filtered = this.allEvaluations();
    if (this.selectedStatus()) filtered = filtered.filter(e => e.status === this.selectedStatus());
    if (this.selectedType()) filtered = filtered.filter(e => e.evaluation_type === this.selectedType());
    if (this.selectedPriority()) filtered = filtered.filter(e => e.priority === this.selectedPriority());
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e =>
        (e.nss_personnel_name?.toLowerCase() || '').includes(q) ||
        (e.title ?? e.file_name ?? '').toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q) ||
        (e.supervisor_name?.toLowerCase() || '').includes(q)
      );
    }
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const pa = (a.priority ?? 'medium') as keyof typeof priorityOrder;
      const pb = (b.priority ?? 'medium') as keyof typeof priorityOrder;
      if (pa !== pb) return priorityOrder[pa] - priorityOrder[pb];
      const da = a.due_date ?? a.uploaded_at ?? '';
      const db = b.due_date ?? b.uploaded_at ?? '';
      return new Date(da || '').getTime() - new Date(db || '').getTime();
    });
  });

  // Counts
  pendingCount() { return this.allEvaluations().filter(e => e.status === 'pending').length; }
  overdueCount() { return this.allEvaluations().filter(e => e.is_overdue).length; }
  underReviewCount() { return this.allEvaluations().filter(e => e.status === 'under_review').length; }
  completedCount() { return this.dashboardStats().completedToday || 0; }

  // Loaders
  loadEvaluations() {
    this.loading.set(true);
    const params = {
      status: this.selectedStatus() || undefined,
      evaluation_type: this.selectedType() || undefined,
      priority: this.selectedPriority() || undefined,
      page: this.currentPage(),
      page_size: this.pageSize()
    };
    const obs = this.mode === 'admin'
      ? this.evaluationService.getAdminEvaluations(params)
      : this.evaluationService.getSupervisorEvaluations(params);

    obs.subscribe({
      next: res => {
        // Both admin and supervisor APIs now return both standard evaluations and PDF forms
        const standardEvaluations = (res.results || []).filter((item: any) => item.source === 'evaluation') as Evaluation[];
        const pdfForms = (res.results || []).filter((item: any) => item.source === 'pdf') as any[];

        this.evaluations.set(standardEvaluations);
        this.evaluationForms.set(pdfForms);

        this.totalPages.set(res.total_pages || 1);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading evaluations:', err);
        this.evaluations.set([]);
        this.evaluationForms.set([]);
        this.loading.set(false);
      }
    });
  }

  loadDashboardStats() {
    if (this.mode === 'admin') {
      this.loadAdminDashboardStats();
    } else {
      this.evaluationService.getDashboardStats().subscribe({
        next: stats => this.dashboardStats.set({
          totalSubmissions: stats.total_submissions || 0,
          pendingReviews: stats.total_pending || 0,
          approvedSubmissions: stats.approved || 0,
          rejectedSubmissions: stats.rejected || 0,
          totalPersonnel: 0,
          activeSupervisors: 0,
          completedToday: stats.completed_today || 0
        }),
        error: err => console.error('Dashboard stats error:', err)
      });
    }
  }

  loadAdminDashboardStats() {
    this.evaluationService.getAdminDashboardStats().subscribe({
      next: stats => this.dashboardStats.set(stats),
      error: err => console.error('Admin dashboard stats error:', err)
    });
  }

  loadEvaluationForms(type?: string) {
    this.pdfService.getEvaluationForms(type).subscribe({
      next: forms => this.evaluationForms.set(forms || []),
      error: err => {
        console.error('Error loading forms:', err);
        this.evaluationForms.set([]);
      }
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadEvaluations();
  }

  // UI Filters
  onStatusChange(e: Event) { this.selectedStatus.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onTypeChange(e: Event) { this.selectedType.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onPriorityChange(e: Event) { this.selectedPriority.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onSearchChange(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }
  onToggleShowForms(e: Event) { this.showFormsOnly.set((e.target as HTMLInputElement).checked); }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getDueDateClass(d: string) {
    const days = this.getDaysUntilDue(d);
    if (isNaN(days)) return '';
    return days < 0 ? 'overdue' : days <= 3 ? 'due-soon' : '';
  }

  getDaysUntilDue(date: string) {
    if (!date) return NaN;
    const now = new Date(), due = new Date(date);
    if (isNaN(due.getTime())) return NaN;
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDueText(date: string): string {
    if (!date) return 'No due date';
    const days = this.getDaysUntilDue(date);
    if (isNaN(days)) return 'Invalid date';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days remaining`;
  }

  getStatusClass(status: EvaluationStatus) {
    return { pending: 'warning', under_review: 'info', approved: 'success', rejected: 'danger' }[status] || 'secondary';
  }

  getStatusLabel(status: EvaluationStatus) {
    return {
      pending: 'Pending Review', under_review: 'Under Review',
      approved: 'Approved', rejected: 'Rejected'
    }[status] || status;
  }

  getTypeLabel(t: EvaluationType) {
    return { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', project: 'Project' }[t] || t;
  }

  getPriorityLabel(p: EvaluationPriority) {
    return { low: 'Low', medium: 'Medium', high: 'High' }[p] || p;
  }

  getSafeTypeLabel(evaluation: Evaluation): string {
    const type = (evaluation.evaluation_type ?? evaluation.form_type ?? 'monthly') as EvaluationType;
    return this.getTypeLabel(type);
  }

  getSafePriorityLabel(evaluation: Evaluation): string {
    const priority = (evaluation.priority ?? 'medium') as EvaluationPriority;
    return this.getPriorityLabel(priority);
  }

  updatePdfFormStatus(id: number, status: EvaluationStatus) {
    if (this.mode === 'admin') {
      this.pdfService.updateAdminPdfFormStatus(id, status).subscribe({
        next: updated => {
          this.evaluationForms.update(forms => forms.map(f => f.id === updated.id ? updated : f));
          this.loadDashboardStats();
          this.refreshActivityFeed();
        },
        error: err => console.error(`Error updating form to ${status}:`, err)
      });
    } else {
      this.pdfService.updateEvaluationStatus(id, status).subscribe({
        next: updated => {
          this.evaluationForms.update(forms => forms.map(f => f.id === updated.id ? updated : f));
          this.loadDashboardStats();
          this.refreshActivityFeed();
        },
        error: err => console.error(`Error updating form to ${status}:`, err)
      });
    }
  }

  updateStandardEvaluationStatus(e: Evaluation, status: EvaluationStatus, comments: string) {
    const update: EvaluationStatusUpdate = { status, supervisor_comments: comments };
    if (this.mode === 'admin') {
      this.evaluationService.updateAdminEvaluationStatus(e.id, update).subscribe({
        next: updated => {
          this.evaluations.update(all => all.map(ev => ev.id === e.id ? updated : ev));
          this.loadDashboardStats();
          this.refreshActivityFeed();
        },
        error: err => console.error('Failed to update evaluation:', err)
      });
    } else {
      this.evaluationService.updateEvaluationStatus(e.id, update).subscribe({
        next: updated => {
          this.evaluations.update(all => all.map(ev => ev.id === e.id ? updated : ev));
          this.loadDashboardStats();
          this.refreshActivityFeed();
        },
        error: err => console.error('Failed to update evaluation:', err)
      });
    }
  }

  startReview(e: Evaluation) {
    const isForm = this.evaluationForms().some(f => f.id === e.id);
    isForm ? this.updatePdfFormStatus(e.id, 'under_review') : this.updateStandardEvaluationStatus(e, 'under_review', 'Started review');
  }

  approveEvaluation(e: Evaluation, comments = 'Approved') {
    const isForm = this.evaluationForms().some(f => f.id === e.id);
    isForm ? this.updatePdfFormStatus(e.id, 'approved') : this.updateStandardEvaluationStatus(e, 'approved', comments);
  }

  rejectEvaluation(e: Evaluation, comments = 'Rejected') {
    const isForm = this.evaluationForms().some(f => f.id === e.id);
    isForm ? this.updatePdfFormStatus(e.id, 'rejected') : this.updateStandardEvaluationStatus(e, 'rejected', comments);
  }

  bulkApprove(): void {
    const selected = this.allEvaluations().filter(e => this.selectedEvaluationIds().includes(e.id));
    let count = 0;
    if (!selected.length) {
      this.toast.warning('No evaluations selected');
      return;
    }

    selected.forEach(e => {
      const isForm = this.evaluationForms().some(f => f.id === e.id);
      if (isForm) {
        this.pdfService.updateEvaluationStatus(e.id, 'approved').subscribe({
          next: updated => {
            this.evaluationForms.update(forms => forms.map(f => f.id === updated.id ? updated : f));
            count++;
            if (count === selected.length) this.afterBulkAction(count, 'approved');
          },
          error: err => console.error(`Form #${e.id} approve failed`, err)
        });
      } else {
        const update: EvaluationStatusUpdate = { status: 'approved', supervisor_comments: 'Bulk approved' };
        this.evaluationService.updateEvaluationStatus(e.id, update).subscribe({
          next: updated => {
            this.evaluations.update(evals => evals.map(ev => ev.id === updated.id ? updated : ev));
            count++;
            if (count === selected.length) this.afterBulkAction(count, 'approved');
          },
          error: err => console.error(`Evaluation #${e.id} approve failed`, err)
        });
      }
    });
  }

  bulkReject(): void {
    const selected = this.allEvaluations().filter(e => this.selectedEvaluationIds().includes(e.id));
    let count = 0;
    if (!selected.length) {
      this.toast.warning('No evaluations selected');
      return;
    }

    selected.forEach(e => {
      const isForm = this.evaluationForms().some(f => f.id === e.id);
      if (isForm) {
        this.pdfService.updateEvaluationStatus(e.id, 'rejected').subscribe({
          next: updated => {
            this.evaluationForms.update(forms => forms.map(f => f.id === updated.id ? updated : f));
            count++;
            if (count === selected.length) this.afterBulkAction(count, 'rejected');
          },
          error: err => console.error(`Form #${e.id} reject failed`, err)
        });
      } else {
        const update: EvaluationStatusUpdate = { status: 'rejected', supervisor_comments: 'Bulk rejected' };
        this.evaluationService.updateEvaluationStatus(e.id, update).subscribe({
          next: updated => {
            this.evaluations.update(evals => evals.map(ev => ev.id === updated.id ? updated : ev));
            count++;
            if (count === selected.length) this.afterBulkAction(count, 'rejected');
          },
          error: err => console.error(`Evaluation #${e.id} reject failed`, err)
        });
      }
    });
  }

  private afterBulkAction(count: number, status: string) {
    this.toast.success(`${count} evaluations ${status}`);
    this.clearSelection();
    this.loadDashboardStats();
    this.refreshActivityFeed();
  }

  toggleEvaluationSelection(id: number) {
    this.selectedEvaluationIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  clearSelection() {
    this.selectedEvaluationIds.set([]);
  }

  viewDetails(e: Evaluation) {
    let url = e.signed_pdf || e.file;
    if (url && !url.startsWith('http')) {
      url = 'http://127.0.0.1:8000/' + url.replace(/^\//, '');
    }
    if (url && url.includes('/media/signed_docs/')) {
      url = url.replace('/media/signed_docs/', '/file_uploads/media/signed_docs/');
    }
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toast.error('No PDF file available to view.');
    }
  }

  openPdfInNewTab(e: Evaluation) {
    let url = e.signed_pdf || e.file;
    if (url && !url.startsWith('http')) {
      url = 'http://127.0.0.1:8000/' + url.replace(/^\//, '');
    }
    if (url && url.includes('/media/signed_docs/')) {
      url = url.replace('/media/signed_docs/', '/file_uploads/media/signed_docs/');
    }
    if (url) {
      window.open(url, '_blank');
    } else {
      this.toast.error('No PDF file available to view.');
    }
  }

  contactPersonnel(e: Evaluation) {
    if (e.nss_personnel_email) window.location.href = `mailto:${e.nss_personnel_email}?subject=Regarding: ${e.title}`;
  }

  downloadEvaluationFile(e: Evaluation) {
    let file = e.signed_pdf || e.file;
    if (file && !file.startsWith('http')) {
      file = 'http://127.0.0.1:8000/' + file.replace(/^\//, '');
    }
    if (file) {
      // Create a temporary anchor to trigger download
      const link = document.createElement('a');
      link.href = file;
      link.target = '_blank';
      // Try to extract a filename from the URL
      const filename = file.split('/').pop() || 'document.pdf';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.toast.error('No PDF file available to download.');
    }
  }

  appendSignature(evaluation: Evaluation) {
    const pdfId = evaluation.id;
    if (this.mode === 'admin') {
      this.router.navigate(['/admin-dashboard/sign', pdfId]);
    } else {
      this.router.navigate(['/supervisor-dashboard/sign', pdfId]);
    }
  }

  downloadForm(f: PDF) {
    const file = f.signed_file || f.file;
    if (file) window.open(file, '_blank');
  }

  useFormTemplate(form: PDF) {
    console.log('Using form:', form);
  }

  refreshActivityFeed() {
    this.dashboardService.refreshActivityFeed();
  }

  // Optionally, extract performance if present in evaluation model
  getPerformance(e: Evaluation): string | number | undefined {
    return (e as any).performance || (e as any).evaluationScore;
  }
}
