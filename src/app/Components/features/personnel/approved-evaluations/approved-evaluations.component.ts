import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { NssPersonelService } from '../../../../services/nss_personel.service';
import { PdfService } from '../../../../services/pdf.service';
import { GhostDetectionService } from '../../../../services/ghost-detection.service';

@Component({
  selector: 'app-approved-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './approved-evaluations.component.html',
  styleUrl: './approved-evaluations.component.css'
})
export class ApprovedEvaluationsComponent implements OnInit {
  evaluations: any[] = [];
  loading = true;
  error: string | null = null;
  formTypes = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annual', label: 'Annual' },
    { value: 'Project', label: 'Project' }
  ];
  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  admins: any[] = [];
  submissionState: { [id: number]: any } = {};
  notification: { type: 'success' | 'error', message: string } | null = null;
  isSubmitting = false;
  progress = 0;

  // Remove local ghost detection state
  // isGhostChecking = false;
  // ghostCheckProgress = 0;
  // ghostCheckMessage = '';
  // ghostCheckSteps = [...];
  // currentGhostStep = 0;

  // Add observables for ghost detection UI
  isGhostChecking$!: any;
  ghostCheckProgress$!: any;
  ghostCheckMessage$!: any;
  ghostCheckSteps!: string[];
  currentGhostStep$!: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private nssService: NssPersonelService,
    private pdfService: PdfService,
    private ghostDetectionService: GhostDetectionService
  ) {
    this.isGhostChecking$ = this.ghostDetectionService.isChecking$;
    this.ghostCheckProgress$ = this.ghostDetectionService.progress$;
    this.ghostCheckMessage$ = this.ghostDetectionService.message$;
    this.ghostCheckSteps = this.ghostDetectionService.ghostCheckSteps;
    this.currentGhostStep$ = this.ghostDetectionService.currentStep$;
  }

  ngOnInit() {
    console.log('[DEBUG] ApprovedEvaluationsComponent loaded');
    this.fetchEvaluations();
    this.fetchAdmins();
  }

  fetchEvaluations() {
    this.loading = true;
    console.log('[DEBUG] fetchEvaluations called');
    this.http.get<any>(environment.apiUrl + 'evaluations/personnel/approved-evaluations/').subscribe({
      next: (res) => {
        console.log('[DEBUG] fetchEvaluations response:', res);
        this.evaluations = res.results || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('[DEBUG] fetchEvaluations error:', err);
        this.error = 'Failed to load approved evaluations.';
        this.loading = false;
      }
    });
  }

  fetchAdmins() {
    this.nssService.getAllMyAdmins().subscribe({
      next: (admins: any[]) => {
        this.admins = admins || [];
      },
      error: () => {
        this.admins = [];
      }
    });
  }

  getPdfUrl(pdfPath: string): string {
    if (!pdfPath) return '';
    if (pdfPath.startsWith('http')) return pdfPath;
    if (pdfPath.startsWith('/media/')) {
      return environment.apiUrl.replace(/\/$/, '') + pdfPath;
    }
    return pdfPath;
  }

  async submitToAdmin(evaluation: any) {
    const state = this.submissionState[evaluation.id];
    console.log('[DEBUG] submitToAdmin called with evaluation:', evaluation, 'state:', state);
    if (!state || !state.formType || !state.priority || !state.sendTo) {
      this.notification = { type: 'error', message: 'Please fill all fields before submitting.' };
      console.log('[DEBUG] Missing required fields, aborting.');
      return;
    }
    // Print the full admins array for debugging
    console.log('[DEBUG] admins array:', this.admins);
    // Fix: handle string/number mismatches for sendTo/admin ids
    const sendToId = Number(state.sendTo);
    const selectedAdmin = this.admins.find(a => Number(a.id) === sendToId || Number(a.user) === sendToId);
    const isReceiverAdmin = !!selectedAdmin;
    console.log('[DEBUG] selectedAdmin:', selectedAdmin, 'isReceiverAdmin:', isReceiverAdmin, 'admins:', this.admins, 'sendTo:', state.sendTo);
    // Log the payload that will be sent to the backend
    console.log('[DEBUG] Payload to backend:', {
      fileName: evaluation.file_name || evaluation.title || 'signed.pdf',
      formType: state.formType,
      priority: state.priority,
      sendTo: state.sendTo
    });
    if (isReceiverAdmin) {
      // Use GhostDetectionService
      const userData = localStorage.getItem('userData');
      let personnelId = 1;
      if (userData) {
        const user = JSON.parse(userData);
        personnelId = user.id || 1;
      }
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
      console.log('[DEBUG] About to run ghost detection for personnelId:', personnelId, 'token:', token);
      const ghostDetectionPassed = await this.ghostDetectionService.runGhostDetection(personnelId, token);
      console.log('[DEBUG] Ghost detection finished, result:', ghostDetectionPassed);
      if (!ghostDetectionPassed) {
        this.notification = { type: 'error', message: 'Submission blocked due to security verification failure. Please contact administrators.' };
        console.log('[DEBUG] Ghost detected, aborting upload.');
        return; // Do NOT proceed to upload
      }
    }
    // Only proceed to upload if ghostDetectionPassed is true or not needed
    this.isSubmitting = true;
    this.progress = 0;
    try {
      // Download the signed PDF file
      const pdfUrl = this.getPdfUrl(evaluation.signed_pdf || evaluation.signed_file || evaluation.file);
      let fileName = evaluation.file_name || evaluation.title || 'signed.pdf';
      if (!fileName.endsWith('.pdf')) fileName += '.pdf';
      console.log('[DEBUG] Downloading PDF from:', pdfUrl, 'as fileName:', fileName);
      const pdfFile = await this.urlToFile(pdfUrl, fileName);
      const isValidPDF = await this.validatePDF(pdfFile);
      if (!isValidPDF) throw new Error('The file is not a valid PDF document.');
      console.log('[DEBUG] PDF is valid, starting upload.');
      this.pdfService.SendEvaluationForm(
        fileName,
        pdfFile,
        state.formType,
        state.priority,
        state.sendTo
      ).subscribe({
        next: (event: any) => {
          if (event.type === 1 && event.total) {
            this.progress = Math.round((100 * event.loaded) / event.total);
            console.log('[DEBUG] Upload progress:', this.progress);
          } else if (event.type === 4) {
            this.notification = { type: 'success', message: event.body?.message || 'Submitted to admin successfully!' };
            this.isSubmitting = false;
            this.progress = 0;
            this.fetchEvaluations();
            console.log('[DEBUG] Upload complete, response:', event.body);
          }
        },
        error: (err: any) => {
          this.notification = { type: 'error', message: err.error?.error || 'Submission failed. Please try again.' };
          this.isSubmitting = false;
          this.progress = 0;
          console.log('[DEBUG] Upload error:', err);
        }
      });
    } catch (err: any) {
      this.notification = { type: 'error', message: err.message || 'Could not prepare PDF file.' };
      this.isSubmitting = false;
      this.progress = 0;
      console.log('[DEBUG] Error preparing PDF file:', err);
    }
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

  async downloadPdf(pdfUrl: string, fileName: string) {
    const fetchUrl = this.getPdfUrl(pdfUrl);
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken') || localStorage.getItem('access_token') || localStorage.getItem('authToken');
    const response = await fetch(fetchUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      alert('Failed to fetch PDF');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
    a.target = '_blank';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private async urlToFile(url: string, filename: string): Promise<File> {
    // Download the file as a blob and convert to File
    const fetchUrl = this.getPdfUrl(url);
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    const blob = await response.blob();
    return new File([blob], filename, { type: 'application/pdf', lastModified: Date.now() });
  }

  setField(evaluationId: number, field: string, value: any) {
    if (!this.submissionState[evaluationId]) {
      this.submissionState[evaluationId] = {};
    }
    this.submissionState[evaluationId][field] = value;
  }

  closeNotification() {
    this.notification = null;
  }

  asNumber(val: any): number {
    return typeof val === 'number' ? val : Number(val);
  }
}
