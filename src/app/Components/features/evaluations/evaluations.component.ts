import { CommonModule } from '@angular/common';
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation, EvaluationDashboardStats, EvaluationListResponse, EvaluationPriority, EvaluationStatus, EvaluationStatusUpdate, EvaluationType } from '../../../model/interface/evaluation';
import { PDF } from '../../../model/interface/pdf';
import { PdfService } from '../../../services/pdf.service';


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

  // Filter states
  selectedStatus = signal<string>('');
  selectedType = signal<string>('');
  selectedPriority = signal<string>('');
  searchQuery = signal<string>('');
  showFormsOnly = signal<boolean>(false); // New toggle for showing forms vs evaluations

  // Data states
  evaluations = signal<Evaluation[]>([]);
  dashboardStats = signal<EvaluationDashboardStats>({
    pending: 0,
    approved: 0,
    overdue: 0,
    under_review: 0,
    completed_today: 0
  });
  evaluationForms = signal<PDF[]>([]);

  // Loading and pagination states
  loading = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  pageSize = signal<number>(10);

  ngOnInit() {
    this.loadEvaluations();
    this.loadDashboardStats();
    this.loadEvaluationForms();
  }

  // Computed filtered evaluations
  filteredEvaluations = computed(() => {
    let filtered = this.evaluations();

    if (this.selectedStatus()) {
      filtered = filtered.filter(e => e.status === this.selectedStatus());
    }

    if (this.selectedType()) {
      filtered = filtered.filter(e => e.evaluation_type === this.selectedType());
    }

    if (this.selectedPriority()) {
      filtered = filtered.filter(e => e.priority === this.selectedPriority());
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e =>
        (e.nss_personnel_name?.toLowerCase() || '').includes(query) ||
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        (e.supervisor_name?.toLowerCase() || '').includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // Sort by priority first (high -> medium -> low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by due date (earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  });

  // Computed filtered evaluation forms
  filteredEvaluationForms = computed(() => {
    let filtered = this.evaluationForms();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(form =>
        form.priority?.toLowerCase().includes(query) ||
        (form.form_type?.toLowerCase() || '').includes(query) ||
        (form.form_type?.toLowerCase() || '').includes(query)
      );
    }

    if (this.selectedType()) {
      filtered = filtered.filter(form => form.form_type === this.selectedType());
    }

    // Replace 'uploaded_at' with the correct date property if different
    return filtered.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  });

  /**
   * Returns the count of pending evaluations from the current evaluations array
   */
  pendingCount(): number {
    return this.evaluations().filter(e => e.status === 'pending').length;
  }

  /**
   * Returns the count of overdue evaluations
   */
  overdueCount(): number {
    return this.evaluations().filter(e => e.is_overdue).length;
  }

  /**
   * Returns the count of evaluations under review
   */
  underReviewCount(): number {
    return this.evaluations().filter(e => e.status === 'under_review').length;
  }

  /**
   * Returns the count of completed evaluations
   */
  completedCount(): number {
    return this.evaluations().filter(e => e.status === 'approved').length;
  }

  // Load data methods
  loadEvaluations() {
    this.loading.set(true);
    const params = {
      status: this.selectedStatus() || undefined,
      evaluation_type: this.selectedType() || undefined,
      priority: this.selectedPriority() || undefined,
      page: this.currentPage(),
      page_size: this.pageSize()
    };

    this.evaluationService.getSupervisorEvaluations(params).subscribe({
      next: (response: EvaluationListResponse) => {
        this.evaluations.set(response.results);
        this.totalPages.set(response.total_pages);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.loading.set(false);
      }
    });
  }

  loadDashboardStats() {
    this.evaluationService.getDashboardStats().subscribe({
      next: (stats: EvaluationDashboardStats) => {
        this.dashboardStats.set(stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  loadEvaluationForms(formType?: string) {
    this.pdfService.getEvaluationForms(formType).subscribe({
      next: (forms: PDF[]) => {
        this.evaluationForms.set(forms);
      },
      error: (error) => {
        console.error('Error loading evaluation forms:', error);
      }
    });
  }

  // Filter methods
  applyFilters() {
    this.currentPage.set(1);
    if (this.showFormsOnly()) {
      this.loadEvaluationForms(this.selectedType() || undefined);
    } else {
      this.loadEvaluations();
    }
  }

  onStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value);
    this.applyFilters();
  }

  onTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedType.set(target.value);
    this.applyFilters();
  }

  onPriorityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedPriority.set(target.value);
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.applyFilters();
  }

  onToggleShowForms(event: Event) {
    const target = event.target as HTMLInputElement;
    this.showFormsOnly.set(target.checked);
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      if (this.showFormsOnly()) {
        this.loadEvaluationForms(this.selectedType() || undefined);
      } else {
        this.loadEvaluations();
      }
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getDueDateClass(dueDateString: string): string {
    const now = new Date();
    const dueDate = new Date(dueDateString);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'due-soon';
    return '';
  }

  getDaysUntilDue(dueDateString: string): number {
    const now = new Date();
    const dueDate = new Date(dueDateString);
    return Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDaysUntilDueText(dueDateString: string): string {
    const days = this.getDaysUntilDue(dueDateString);

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days remaining`;
  }

  getStatusClass(status: EvaluationStatus): string {
    const statusMap: Record<EvaluationStatus, string> = {
      pending: 'warning',
      under_review: 'info',
      approved: 'success',
      rejected: 'danger'
    };
    return statusMap[status] || 'secondary';
  }

  getStatusLabel(status: EvaluationStatus): string {
    const statusMap: Record<EvaluationStatus, string> = {
      pending: 'Pending Review',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return statusMap[status] || status;
  }

  getTypeLabel(type: EvaluationType): string {
    const typeMap: Record<EvaluationType, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annual: 'Annual',
      project: 'Project'
    };
    return typeMap[type] || type;
  }

  getPriorityLabel(priority: EvaluationPriority): string {
    const priorityMap: Record<EvaluationPriority, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };
    return priorityMap[priority] || priority;
  }

  getPriorityClass(priority: EvaluationPriority): string {
    const priorityMap: Record<EvaluationPriority, string> = {
      low: 'success',
      medium: 'warning',
      high: 'danger'
    };
    return priorityMap[priority] || 'secondary';
  }

  // Action methods
  startReview(evaluation: Evaluation) {
    const update: EvaluationStatusUpdate = {
      status: 'under_review',
      supervisor_comments: 'Review started'
    };

    this.evaluationService.updateEvaluationStatus(evaluation.id, update).subscribe({
      next: (updatedEvaluation: Evaluation) => {
        // Update the local evaluation
        this.evaluations.update(evals =>
          evals.map(e => e.id === evaluation.id ? updatedEvaluation : e)
        );
        // Refresh dashboard stats
        this.loadDashboardStats();
      },
      error: (error) => {
        console.error('Error starting review:', error);
      }
    });
  }

  approveEvaluation(evaluation: Evaluation, comments?: string) {
    const update: EvaluationStatusUpdate = {
      status: 'approved',
      supervisor_comments: comments || 'Evaluation approved'
    };

    this.evaluationService.updateEvaluationStatus(evaluation.id, update).subscribe({
      next: (updatedEvaluation: Evaluation) => {
        this.evaluations.update(evals =>
          evals.map(e => e.id === evaluation.id ? updatedEvaluation : e)
        );
        this.loadDashboardStats();
      },
      error: (error) => {
        console.error('Error approving evaluation:', error);
      }
    });
  }

  rejectEvaluation(evaluation: Evaluation, comments?: string) {
    const update: EvaluationStatusUpdate = {
      status: 'rejected',
      supervisor_comments: comments || 'Evaluation rejected'
    };

    this.evaluationService.updateEvaluationStatus(evaluation.id, update).subscribe({
      next: (updatedEvaluation: Evaluation) => {
        this.evaluations.update(evals =>
          evals.map(e => e.id === evaluation.id ? updatedEvaluation : e)
        );
        this.loadDashboardStats();
      },
      error: (error) => {
        console.error('Error rejecting evaluation:', error);
      }
    });
  }

  viewDetails(evaluation: Evaluation) {
    // Navigate to detailed view or open modal
    console.log('Viewing details for:', evaluation.title);
  }

  contactPersonnel(evaluation: Evaluation) {
    if (evaluation.nss_personnel_email) {
      // Open email client or messaging interface
      window.location.href = `mailto:${evaluation.nss_personnel_email}?subject=Regarding: ${evaluation.title}`;
    }
  }

  downloadEvaluationFile(evaluation: Evaluation) {
    if (evaluation.file || evaluation.signed_pdf) {
      const fileUrl = evaluation.signed_pdf || evaluation.file;
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }
    }
  }

  downloadForm(form: PDF) {
    if (form.signed_file || form.file) {
      const fileUrl = form.signed_file || form.file;
      window.open(fileUrl, '_blank');
    }
  }

  // Bulk operations
  selectedEvaluationIds = signal<number[]>([]);

  toggleEvaluationSelection(evaluationId: number) {
    this.selectedEvaluationIds.update(ids => {
      if (ids.includes(evaluationId)) {
        return ids.filter(id => id !== evaluationId);
      } else {
        return [...ids, evaluationId];
      }
    });
  }

  selectAllEvaluations() {
    const allIds = this.filteredEvaluations().map(e => e.id);
    this.selectedEvaluationIds.set(allIds);
  }

  clearSelection() {
    this.selectedEvaluationIds.set([]);
  }

  bulkApprove(comments?: string) {
    if (this.selectedEvaluationIds().length === 0) return;

    this.evaluationService.bulkUpdateStatus({
      evaluation_ids: this.selectedEvaluationIds(),
      status: 'approved',
      supervisor_comments: comments
    }).subscribe({
      next: (response) => {
        console.log(`Bulk approved ${response.updated_count} evaluations`);
        this.clearSelection();
        this.loadEvaluations();
        this.loadDashboardStats();
      },
      error: (error) => {
        console.error('Error in bulk approve:', error);
      }
    });
  }

  bulkReject(comments?: string) {
    if (this.selectedEvaluationIds().length === 0) return;

    this.evaluationService.bulkUpdateStatus({
      evaluation_ids: this.selectedEvaluationIds(),
      status: 'rejected',
      supervisor_comments: comments
    }).subscribe({
      next: (response) => {
        console.log(`Bulk rejected ${response.updated_count} evaluations`);
        this.clearSelection();
        this.loadEvaluations();
        this.loadDashboardStats();
      },
      error: (error) => {
        console.error('Error in bulk reject:', error);
      }
    });
  }



// Add this method to fix the template error
useFormTemplate(form: any): void {
  // TODO: Implement the logic to use the form template
  // For now, just log the form to avoid errors
  console.log('Use form template:', form);
}
}
