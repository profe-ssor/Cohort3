import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PDF, PdfUploadResponse } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Evaluation, EvaluationStatus, EvaluationType } from '../../model/interface/evaluation';
import { EvaluationService } from '../../services/evaluation.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf, FormsModule,  NgFor,NgClass, DatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  environment = environment
  @Input() showUpload: boolean = true;

     fileName: string = '';
     selectedFile: File | null = null;
   isUploading = false;
     errorMessage = '';
     loading = false;
     error: string | null = null;
     successMessage = '';
     pdfs: PDF[] = [];

     // Evaluation tracking state
     evaluations: Evaluation[] = [];
     filteredEvaluations: Evaluation[] = [];
     filterStatus: EvaluationStatus | '' = '';
     filterType: EvaluationType | '' = '';
     sortField: 'created_at' | 'status' | 'title' | 'due_date' | 'reviewed_at' = 'created_at';
     sortDirection: 'asc' | 'desc' = 'desc';
     notificationMessage: string = '';
     showNotification: boolean = false;
     private pollingSubscription?: Subscription;
     private lastStatuses: Record<number, EvaluationStatus> = {};

     constructor(
       private pdfService: PdfService,
       private router: Router,
       private evaluationService: EvaluationService
     ) { }

     ngOnInit(): void {
      this.loadPdfs();
      this.loadEvaluations();
      this.startPollingForStatusChanges();
     }

     ngOnDestroy(): void {
       this.pollingSubscription?.unsubscribe();
     }

     onFileSelect(event: any): void {
       const file = event.target.files[0];
       if (file) {
         if (file.type !== 'application/pdf') {
           this.errorMessage = 'Please select a PDF file.';
           this.selectedFile = null;
           return;
         }

         this.selectedFile = file;

         // Auto-fill the filename field
         const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
         this.fileName = nameWithoutExtension;

         this.errorMessage = '';
       }
     }

     saveFile(): void {
       if (!this.selectedFile) {
         this.errorMessage = 'Please select a file to upload.';
         return;
       }

       if (!this.fileName.trim()) {
         this.errorMessage = 'Please enter a document name.';
         return;
       }

       this.isUploading = true;
       this.errorMessage = '';
       this.successMessage = '';

       this.pdfService.uploadPdf(this.fileName, this.selectedFile).subscribe({
         next: (event: HttpEvent<PdfUploadResponse>) => {
           if (event.type === HttpEventType.Response) { // HttpEventType.Response
             const response = event.body as PdfUploadResponse;
           this.successMessage = response.message || 'File uploaded successfully!';
           this.isUploading = false;

             // Navigate to home page after short delay
             setTimeout(() => {
               this.router.navigate(['/persneldashboard']);
             }, 1500);
           }
         },
         error: (err) => {
           this.isUploading = false;
           this.errorMessage = err.error?.error || 'An error occurred while uploading the file.';
         }
       });
     }

     clearSelection(): void {
       this.selectedFile = null;
       this.fileName = '';
       this.errorMessage = '';
       this.successMessage = '';
     }
// list all pdf
     loadPdfs(): void {
      this.loading = true;
      console.log('🔄 Loading PDFs for footer component...');

      this.pdfService.getPdfs()
        .subscribe({
          next: (data) => {
            console.log('✅ PDFs loaded successfully:', data);
            this.pdfs = data;
            this.loading = false;

            // Log details about each PDF
            if (data && data.length > 0) {
              console.log(`📄 Found ${data.length} PDFs:`);
              data.forEach((pdf, index) => {
                console.log(`  ${index + 1}. ID: ${pdf.id}, Name: ${pdf.file_name}, Signed: ${pdf.is_signed}`);
              });
            } else {
              console.log('❌ No PDFs found in response');
            }
          },
          error: (err) => {
            console.error('❌ Error loading PDFs:', err);
            this.error = 'Failed to load PDFs';
            this.loading = false;
          }
        });
    }

  // --- Evaluation status tracking logic ---
  loadEvaluations(): void {
    this.evaluationService.getPersonnelEvaluations({})
      .subscribe({
        next: (res: any) => {
          this.evaluations = res.results || [];
          this.filteredEvaluations = this.applyFiltersAndSorting();
          // Save last statuses for notification polling
          this.lastStatuses = {};
          for (const evalObj of this.evaluations) {
            this.lastStatuses[evalObj.id] = evalObj.status;
          }
        },
        error: (err) => {
          // fallback: clear evaluations
          this.evaluations = [];
          this.filteredEvaluations = [];
        }
      });
  }

  applyFiltersAndSorting(): Evaluation[] {
    let evals = [...this.evaluations];
    if (this.filterStatus) {
      evals = evals.filter(e => e.status === this.filterStatus);
    }
    if (this.filterType) {
      evals = evals.filter(e =>
        ((e.evaluation_type ?? e.form_type) || '').toLowerCase() === this.filterType.toLowerCase()
      );
    }
    evals.sort((a, b) => {
      let valA: any = a[this.sortField];
      let valB: any = b[this.sortField];
      if (this.sortField === 'created_at' || this.sortField === 'due_date' || this.sortField === 'reviewed_at') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return evals;
  }

  onFilterChange(): void {
    this.filteredEvaluations = this.applyFiltersAndSorting();
  }

  onSort(field: typeof this.sortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filteredEvaluations = this.applyFiltersAndSorting();
  }

  // --- Notification logic ---
  startPollingForStatusChanges(): void {
    this.pollingSubscription = interval(10000).subscribe(() => {
      this.evaluationService.getPersonnelEvaluations({})
        .subscribe({
          next: (res: any) => {
            const newEvals = res.results || [];
            for (const evalObj of newEvals) {
              if (
                this.lastStatuses[evalObj.id] &&
                this.lastStatuses[evalObj.id] !== evalObj.status
              ) {
                this.showStatusNotification(evalObj);
              }
              this.lastStatuses[evalObj.id] = evalObj.status;
            }
            this.evaluations = newEvals;
            this.filteredEvaluations = this.applyFiltersAndSorting();
          }
        });
    });
  }

  showStatusNotification(evalObj: Evaluation): void {
    this.notificationMessage = `Status for "${evalObj.title}" changed to ${evalObj.status_display || evalObj.status}`;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

}
