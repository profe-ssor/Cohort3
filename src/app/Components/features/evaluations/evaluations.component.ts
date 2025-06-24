import { CommonModule } from '@angular/common';
import { Component, signal, computed, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.css'
})
export class EvaluationsComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private pdfService = inject(PdfService);
  private toast = inject(ToastrService);

  selectedStatus = signal<string>('');
  selectedType = signal<string>('');
  selectedPriority = signal<string>('');
  searchQuery = signal<string>('');
  showFormsOnly = signal<boolean>(false);

  evaluations = signal<Evaluation[]>([]);
  evaluationForms = signal<PDF[]>([]);
  selectedEvaluationIds = signal<number[]>([]);

  dashboardStats = signal<EvaluationDashboardStats>({
    pending: 0,
    approved: 0,
    overdue: 0,
    under_review: 0,
    completed_today: 0
  });

  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(10);

  ngOnInit() {
    this.loadEvaluations();
    this.loadDashboardStats();
    this.loadEvaluationForms();
  }

  private convertPdfToEvaluation(pdf: PDF): Evaluation {
    return {
      id: pdf.id,
      title: pdf.file_name,
      description: `${pdf.form_type} evaluation form`,
      evaluation_type: pdf.form_type?.toLowerCase() as EvaluationType || 'monthly',
      priority: pdf.priority as EvaluationPriority || 'medium',
      status: pdf.status as EvaluationStatus || 'pending',
      file: pdf.file,
      signed_pdf: pdf.signed_file,
      created_at: pdf.uploaded_at,
      updated_at: pdf.uploaded_at,
      due_date: pdf.due_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
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
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.supervisor_name?.toLowerCase() || '').includes(q)
      );
    }
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  });

  // Counts
  pendingCount() { return this.allEvaluations().filter(e => e.status === 'pending').length; }
  overdueCount() { return this.allEvaluations().filter(e => e.is_overdue).length; }
  underReviewCount() { return this.allEvaluations().filter(e => e.status === 'under_review').length; }
  completedCount() { return this.allEvaluations().filter(e => e.status === 'approved').length; }

  // Loaders
  loadEvaluations() {
    this.loading.set(true);
    this.evaluationService.getSupervisorEvaluations({
      status: this.selectedStatus() || undefined,
      evaluation_type: this.selectedType() || undefined,
      priority: this.selectedPriority() || undefined,
      page: this.currentPage(),
      page_size: this.pageSize()
    }).subscribe({
      next: res => {
        this.evaluations.set(res.results || []);
        this.totalPages.set(res.total_pages || 1);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading evaluations:', err);
        this.evaluations.set([]);
        this.loading.set(false);
      }
    });
  }

  loadDashboardStats() {
    this.evaluationService.getDashboardStats().subscribe({
      next: stats => this.dashboardStats.set(stats),
      error: err => console.error('Dashboard stats error:', err)
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
    this.loadEvaluationForms(this.selectedType() || undefined);
  }

  // UI Filters
  onStatusChange(e: Event) { this.selectedStatus.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onTypeChange(e: Event) { this.selectedType.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onPriorityChange(e: Event) { this.selectedPriority.set((e.target as HTMLSelectElement).value); this.applyFilters(); }
  onSearchChange(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }
  onToggleShowForms(e: Event) { this.showFormsOnly.set((e.target as HTMLInputElement).checked); }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getDueDateClass(d: string) {
    const days = this.getDaysUntilDue(d);
    return days < 0 ? 'overdue' : days <= 3 ? 'due-soon' : '';
  }

  getDaysUntilDue(date: string) {
    const now = new Date(), due = new Date(date);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDueText(date: string): string {
    const days = this.getDaysUntilDue(date);
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

  updatePdfFormStatus(id: number, status: EvaluationStatus) {
    this.pdfService.updateEvaluationStatus(id, status).subscribe({
      next: updated => {
        this.evaluationForms.update(forms => forms.map(f => f.id === updated.id ? updated : f));
        this.loadDashboardStats();
      },
      error: err => console.error(`Error updating form to ${status}:`, err)
    });
  }

  updateStandardEvaluationStatus(e: Evaluation, status: EvaluationStatus, comments: string) {
    const update: EvaluationStatusUpdate = { status, supervisor_comments: comments };
    this.evaluationService.updateEvaluationStatus(e.id, update).subscribe({
      next: updated => {
        this.evaluations.update(all => all.map(ev => ev.id === e.id ? updated : ev));
        this.loadDashboardStats();
      },
      error: err => console.error('Failed to update evaluation:', err)
    });
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
  }

  toggleEvaluationSelection(id: number) {
    this.selectedEvaluationIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  clearSelection() {
    this.selectedEvaluationIds.set([]);
  }

  viewDetails(e: Evaluation) { console.log('Viewing:', e.title); }

  contactPersonnel(e: Evaluation) {
    if (e.nss_personnel_email) window.location.href = `mailto:${e.nss_personnel_email}?subject=Regarding: ${e.title}`;
  }

  downloadEvaluationFile(e: Evaluation) {
    const file = e.signed_pdf || e.file;
    if (file) window.open(file, '_blank');
  }

  downloadForm(f: PDF) {
    const file = f.signed_file || f.file;
    if (file) window.open(file, '_blank');
  }

  useFormTemplate(form: PDF) {
    console.log('Using form:', form);
  }
}
