import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { NssPersonelService } from '../../services/nss_personel.service';
import { ISupervisorDatabase } from '../../model/interface/supervisor';
import { IAdminDatabase } from '../../model/interface/admin';
import { environment } from '../../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-submit-evaluation',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './submit-evaluation.component.html',
  styleUrl: './submit-evaluation.component.css'
})
export class SubmitEvaluationComponent implements OnInit {
  form: FormGroup;
  signedPdfs: PDF[] = [];
  isSubmitting = false;
  progress = 0;
  message = '';

  supervisor: ISupervisorDatabase | null = null;
  admin: IAdminDatabase | null = null;

  readonly formTypes = ['Monthly', 'Quarterly', 'Annual', 'Project'];
  readonly priorities = ['low', 'medium', 'high'];

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfService,
    private nssService: NssPersonelService,
    private toastr: ToastrService
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
          console.log('Sample PDF URL:', pdfs[0].signed_file); // Debug log
        }
      },
      error: (err) => console.error('Error fetching signed PDFs:', err)
    });
  }

getMySupervisor() {
  console.log('Loading supervisor data...');
  this.nssService.getMySupervisor().subscribe({
    next: (supervisorData) => {
      console.log('✅ Raw supervisor data from API:', supervisorData);

      // Map the API response to match your interface
      this.supervisor = {
        ...supervisorData,
        user_id: supervisorData.user  // Map 'user' to 'user_id'
      };

      console.log('✅ Mapped supervisor data:', this.supervisor);
    },
    error: (error) => {
      console.error('❌ Error fetching supervisor data:', error);
    }
  });
}

getMyAdnib() {
  console.log('Loading admin data...');
  this.nssService.getMyAdmin().subscribe({
    next: (adminData) => {
      console.log('✅ Raw admin data from API:', adminData);

      // Map the API response to match your interface
      this.admin = {
        ...adminData,
        user_id: adminData.user  // Map 'user' to 'user_id'
      };

      console.log('✅ Mapped admin data:', this.admin);
    },
    error: (error) => {
      console.error('❌ Error fetching admin data:', error);
    }
  });
}

async submit(): Promise<void> {
  console.log('=== FORM SUBMISSION START ===');

  // Check form validity first
  console.log('Form valid:', this.form.valid);
  console.log('Form errors:', this.form.errors);

  if (this.form.invalid) {
    console.log('Form is invalid');
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid) {
        console.log(`${key} is invalid:`, control.errors);
      }
    });
    this.message = 'Please fill in all required fields.';
    return;
  }

  const { pdfId, form_type, priority, receiver_id } = this.form.value;

  // Detailed debugging
  console.log('Raw form values:', this.form.value);
  console.log('Destructured values:', { pdfId, form_type, priority, receiver_id });
  console.log('receiver_id details:', {
    value: receiver_id,
    type: typeof receiver_id,
    isNull: receiver_id === null,
    isUndefined: receiver_id === undefined,
    isEmpty: receiver_id === '',
    length: receiver_id?.length
  });

  // Check available recipients
  console.log('Available recipients:');
  if (this.supervisor) {
    console.log('- Supervisor:', {
      user_id: this.supervisor.user_id,
      user_id_type: typeof this.supervisor.user_id,
      full_name: this.supervisor.full_name
    });
  } else {
    console.log('- Supervisor: NOT LOADED');
  }

  if (this.admin) {
    console.log('- Admin:', {
      user_id: this.admin.user_id,
      user_id_type: typeof this.admin.user_id,
      full_name: this.admin.full_name
    });
  } else {
    console.log('- Admin: NOT LOADED');
  }

  // Validate all form values with detailed checks
  if (!pdfId) {
    console.log('pdfId is missing:', pdfId);
    this.message = 'Please select a PDF document.';
    return;
  }

  if (!form_type) {
    console.log('form_type is missing:', form_type);
    this.message = 'Please select a form type.';
    return;
  }

  if (!priority) {
    console.log('priority is missing:', priority);
    this.message = 'Please select a priority.';
    return;
  }

  if (!receiver_id) {
    console.log('receiver_id is missing:', receiver_id);
    this.message = 'Please select a recipient.';
    return;
  }

  const selectedPdf = this.signedPdfs.find(pdf => pdf.id === parseInt(pdfId, 10));

  if (!selectedPdf || !selectedPdf.signed_file) {
    console.log('PDF validation failed:', { selectedPdf, signedPdfs: this.signedPdfs });
    this.message = 'Please select a valid signed PDF.';
    return;
  }

  // Convert receiver_id to number and validate with detailed logging
  console.log('Converting receiver_id to number...');
  console.log('Original receiver_id:', receiver_id);

  const receiverIdNumber = parseInt(receiver_id, 10);
  console.log('Converted receiver_id:', receiverIdNumber);
  console.log('parseInt result:', {
    result: receiverIdNumber,
    isNaN: isNaN(receiverIdNumber),
    isLessThanOrEqualZero: receiverIdNumber <= 0,
    validationPasses: !isNaN(receiverIdNumber) && receiverIdNumber > 0
  });

  if (isNaN(receiverIdNumber) || receiverIdNumber <= 0) {
    console.log('❌ VALIDATION FAILED - receiver_id validation failed');
    console.log('Validation details:', {
      originalValue: receiver_id,
      parsedValue: receiverIdNumber,
      isNaN: isNaN(receiverIdNumber),
      isLessOrEqualZero: receiverIdNumber <= 0
    });
    this.message = 'Please select a valid recipient.';
    return;
  }

  console.log('✅ All validations passed, proceeding with submission...');
  console.log('=== FORM SUBMISSION END ===');

  // Continue with your existing submission logic
  this.isSubmitting = true;
  this.progress = 0;
  this.message = '';

  try {
    console.log('Fetching PDF from URL:', selectedPdf.signed_file);
    const pdfFile = await this.urlToFile(selectedPdf.signed_file, selectedPdf.file_name);

    const isValidPDF = await this.validatePDF(pdfFile);
    if (!isValidPDF) {
      throw new Error('The file is not a valid PDF document.');
    }

    console.log('PDF File created:', {
      name: pdfFile.name,
      type: pdfFile.type,
      size: pdfFile.size
    });

    this.pdfService.SendEvaluationForm(
      selectedPdf.file_name,
      pdfFile,
      form_type,
      priority,
      receiverIdNumber
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
    this.message = err.message || 'Could not prepare PDF file. Please try again.';
    this.isSubmitting = false;
  }
}

  private getJwtToken(): string | null {
    // Try different possible keys - adjust based on how your app stores JWT
    return localStorage.getItem('token') ||
           localStorage.getItem('jwtToken') ||
           localStorage.getItem('access_token') ||
           localStorage.getItem('authToken');
  }

  private async urlToFile(url: string, filename: string): Promise<File> {
    try {
      const token = this.getJwtToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fix the URL - if it's relative, make it absolute using environment
      let fullUrl = url;
      if (url.startsWith('/')) {
        fullUrl = `${environment.API_URL.replace(/\/$/, '')}${url}`; // Remove trailing slash and add URL
      }

      console.log('Full URL:', fullUrl); // Debug log

      const response = await fetch(fullUrl, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Verify it's actually a PDF by checking the blob type
      console.log('Blob type:', blob.type);
      console.log('Blob size:', blob.size);

      // Force the correct MIME type for PDF
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });

      // Ensure filename has .pdf extension
      const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

      return new File([pdfBlob], pdfFilename, {
        type: 'application/pdf',
        lastModified: Date.now()
      });
    } catch (error) {
      console.error('Error in urlToFile:', error);
      throw error;
    }
  }

  private async validatePDF(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Check PDF magic number (should start with %PDF)
        const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
        const isValidPDF = pdfHeader === '%PDF';

        console.log('PDF Header:', pdfHeader);
        console.log('Is valid PDF:', isValidPDF);

        resolve(isValidPDF);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 10)); // Read first 10 bytes
    });
  }
}
