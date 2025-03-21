import { Component } from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { NgIf } from '@angular/common';
import { PDF, PdfSignResponse } from '../../model/interface/pdf';

@Component({
  selector: 'app-signature-ad',
  standalone: true,
  imports: [NgIf],
  templateUrl: './signature-ad.component.html',
  styleUrl: './signature-ad.component.css'
})
export class SignatureAdComponent {
  selectedFile: File | null = null;
  signedPdf: string | null = null;
  pdfId: number | null = null;
  pdffile: PDF = {
    id: 0,
    file_name: '',
    file: '',
    signature_image: null,
    signature_drawing: null,
    is_signed: false,
    signed_file: null,
    uploaded_at: ''
  }

  constructor(private pdfService: PdfService) {}

  // Handle File Selection
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
    }
  }
  signWithDrawing(pdfId: number, signatureData: string) {
    this.pdfService.signPdfWithDrawing(pdfId, signatureData).subscribe({
      next: (res: PdfSignResponse) => {
        console.log('PDF signed successfully:', res);
        alert('PDF signed successfully!');
      },
      error: (err) => {
        console.error('Error signing PDF:', err);
        alert('Failed to sign PDF.');
      }
    });
  }
  // Upload PDF to Server
  uploadPdf() {
    if (!this.selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    this.pdfService.uploadPdf(this.selectedFile.name, this.selectedFile).subscribe({
      next: (event) => {
        if ('body' in event && event.body) {
          this.pdfId = event.body.data.id; // Store uploaded PDF ID
          alert('PDF uploaded successfully!');
        }
      },
      error: () => {
        alert('Failed to upload PDF.');
      }
    });
  }

  // Sign with Drawing
  // Sign with Image
  signWithImage() {
    if (!this.pdfId) {
      alert('Please upload a PDF first.');
      return;
    }

    const sampleSignatureImage = 'data:image/png;base64,SIGNATURE_IMAGE_DATA'; // Placeholder for real signature image
    this.pdfService.signPdfWithDrawing(this.pdfId, sampleSignatureImage).subscribe({
      next: (response) => {
        this.signedPdf = response.data.signed_file;
        alert('PDF signed with image successfully!');
      },
      error: () => {
        alert('Failed to sign PDF.');
      }
    });
  }

}