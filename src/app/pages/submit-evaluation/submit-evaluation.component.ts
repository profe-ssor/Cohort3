import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NssPersonelService } from '../../services/nss_personel.service';
import { ISupervisorDatabase } from '../../model/interface/supervisor';
import { IAdminDatabase } from '../../model/interface/admin';
import { environment } from '../../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-submit-evaluation',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule, FormsModule],
  templateUrl: './submit-evaluation.component.html',
  styleUrl: './submit-evaluation.component.css'
})
export class SubmitEvaluationComponent implements OnInit {
  form: FormGroup;
  signedPdfs: PDF[] = [];
  isSubmitting = false;
  progress = 0;
  message = '';
  selectedPdf: PDF | null = null;

  supervisor: ISupervisorDatabase | null = null;
  admin: IAdminDatabase | null = null;

  readonly formTypes = ['Monthly', 'Quarterly', 'Annual', 'Project'];
  readonly priorities = ['low', 'medium', 'high'];

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfService,
    private nssService: NssPersonelService,
    private toastr: ToastrService,
    private http: HttpClient // ✅ Inject HttpClient
  ) {
    this.form = this.fb.group({
      pdfId: ['', Validators.required],
      form_type: ['', Validators.required],
      priority: ['', Validators.required],
      receiver_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getMySupervisor();
    this.getMyAdnib();

    this.pdfService.getSignedPdfs().subscribe({
      next: (pdfs) => {
        this.signedPdfs = pdfs;
        if (pdfs.length > 0) {
          console.log('Sample PDF URL:', pdfs[0].signed_file);
        }
      },
      error: (err) => console.error('Error fetching signed PDFs:', err)
    });
  }

  onPdfChange(event: any): void {
    const selectedId = parseInt(event.target.value, 10);
    this.selectedPdf = this.signedPdfs.find(pdf => pdf.id === selectedId) || null;
  }

  getMySupervisor() {
    this.nssService.getMySupervisor().subscribe({
      next: (supervisorData) => {
        this.supervisor = supervisorData;
      },
      error: (error) => {
        console.error('Error fetching supervisor data:', error);
      }
    });
  }

  getMyAdnib() {
    this.nssService.getMyAdmin().subscribe({
      next: (adminData) => {
        this.admin = adminData;
      },
      error: (error) => {
        console.error('Error fetching admin data:', error);
      }
    });
  }

  async submit(): Promise<void> {
    console.log('=== FORM SUBMISSION START ===');

    if (this.form.invalid) {
      this.message = 'Please fill in all required fields.';
      return;
    }

    const { pdfId, form_type, priority, receiver_id } = this.form.value;
    this.selectedPdf = this.signedPdfs.find(pdf => pdf.id === parseInt(pdfId, 10)) || null;
    const selectedPdf = this.selectedPdf;

    if (!selectedPdf || !selectedPdf.signed_file) {
      this.message = 'Please select a valid signed PDF.';
      return;
    }

    // Handle optional sign marking
    if (selectedPdf.mark_as_signed) {
      const token = this.getJwtToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      try {
        await this.http.patch(
          `${environment.API_URL}file_uploads/pdf/${selectedPdf.id}/update/`,
          { mark_as_signed: true },
          { headers }
        ).toPromise();

        console.log('✅ File marked as signed successfully');
      } catch (err) {
        console.error('Failed to mark as signed:', err);
        this.toastr.error('Could not mark PDF as signed.');
        return;
      }
    }

    const receiverIdNumber = parseInt(receiver_id, 10);
    if (isNaN(receiverIdNumber) || receiverIdNumber <= 0) {
      this.message = 'Please select a valid recipient.';
      return;
    }

    this.isSubmitting = true;
    this.progress = 0;
    this.message = '';

    try {
      const pdfFile = await this.urlToFile(selectedPdf.signed_file, selectedPdf.file_name);

      const isValidPDF = await this.validatePDF(pdfFile);
      if (!isValidPDF) throw new Error('The file is not a valid PDF document.');

      this.pdfService.SendEvaluationForm(
        selectedPdf.file_name,
        pdfFile,
        form_type,
        priority,
        receiverIdNumber,
      ).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.progress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.toastr.success(event.body?.message || 'Evaluation form submitted successfully!');
            this.isSubmitting = false;
            this.form.reset();
          }
        },
        error: (err: any) => {
          console.error('Submission error:', err);
          this.toastr.error(err.error?.error || 'Submission failed. Please try again.');
          this.isSubmitting = false;
        }
      });
    } catch (err: any) {
      console.error('Error preparing PDF file:', err);
      this.message = err.message || 'Could not prepare PDF file.';
      this.isSubmitting = false;
    }
  }

  private getJwtToken(): string | null {
    return localStorage.getItem('token') ||
           localStorage.getItem('jwtToken') ||
           localStorage.getItem('access_token') ||
           localStorage.getItem('authToken');
  }

  private async urlToFile(url: string, filename: string): Promise<File> {
    const token = this.getJwtToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let fullUrl = url;
    if (url.startsWith('/')) {
      fullUrl = `${environment.API_URL.replace(/\/$/, '')}${url}`;
    }

    const response = await fetch(fullUrl, { headers });
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);

    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    return new File([pdfBlob], pdfFilename, {
      type: 'application/pdf',
      lastModified: Date.now()
    });
  }

  private async validatePDF(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const header = String.fromCharCode(...new Uint8Array(buffer).slice(0, 4));
        resolve(header === '%PDF');
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 10));
    });
  }
}
