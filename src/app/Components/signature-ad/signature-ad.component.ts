import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { PdfService } from '../../services/pdf.service';
import { NgIf, NgStyle } from '@angular/common';
import { PDF, PdfSignResponse, SignaturePosition } from '../../model/interface/pdf';

// Import pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-signature-ad',
  standalone: true,
  imports: [NgIf, NgStyle],
  templateUrl: './signature-ad.component.html',
  styleUrls: ['./signature-ad.component.css'] // <- corrected this!
})
export class SignatureAdComponent implements AfterViewInit {
  selectedFile: File | null = null;
  signatureUrl: string | null = null;
  signedPdf: string | null = null;
  pdfId: number | null = null;
  signatureImageFile: File | null = null;

  signatureX: number = 50;
  signatureY: number = 50;
  isDragging: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;

  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContainer') pdfContainerRef!: ElementRef<HTMLDivElement>;

  pdffile: PDF = {
    id: 0,
    file_name: '',
    file: '',
    signature_image: null,
    signature_drawing: null,
    is_signed: false,
    signed_file: null,
    uploaded_at: ''
  };

  constructor(private pdfService: PdfService) {}

  ngAfterViewInit(): void {
    // Optional: Render here
     // Set the workerSrc to your local worker file
     pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';

     // Set it here
  }
  onSignatureImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.signatureImageFile = target.files[0];
      this.signatureUrl = URL.createObjectURL(this.signatureImageFile); // For preview & drag
    }
  }
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.renderPDF(URL.createObjectURL(this.selectedFile));
    }
  }

  renderPDF(pdfUrl: string) {
    const canvas = this.pdfCanvasRef.nativeElement;
    const context = canvas.getContext('2d');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';




    pdfjsLib.getDocument(pdfUrl).promise.then((pdf: any) => {
      pdf.getPage(1).then((page: any) => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context!,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
  }

  startDragging(event: MouseEvent) {
    this.isDragging = true;
    this.offsetX = event.offsetX;
    this.offsetY = event.offsetY;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.stopDragging);
  }

  onMouseMove = (event: MouseEvent) => {
    if (this.isDragging) {
      const container = this.pdfContainerRef.nativeElement;
      const rect = container.getBoundingClientRect();
      this.signatureX = event.clientX - rect.left - this.offsetX;
      this.signatureY = event.clientY - rect.top - this.offsetY;
    }
  };

  stopDragging = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
  };

  uploadPdf() {
    if (!this.selectedFile) {
      alert('Please select a PDF file first.');
      return;
    }

    this.pdfService.uploadPdf(this.selectedFile.name, this.selectedFile).subscribe({
      next: (event) => {
        if ('body' in event && event.body) {
          this.pdfId = event.body.data.id;
          alert('PDF uploaded successfully!');
        }
      },
      error: () => {
        alert('Failed to upload PDF.');
      }
    });
  }

  signWithImage() {
    if (!this.pdfId || !this.signatureImageFile) {
      alert('Upload both the PDF and signature image first.');
      return;
    }

    const position: SignaturePosition = {
      x: this.signatureX,
      y: this.signatureY,
      width: 100, // Customize as needed
      height: 50
    };

    const formData = new FormData();
    formData.append('signature', this.signatureImageFile);
    formData.append('position', JSON.stringify(position));

    this.pdfService.signPdfWithImage(this.pdfId, this.signatureImageFile, position).subscribe({
      next: (res: PdfSignResponse) => {
        console.log('PDF signed successfully:', res);
        alert('PDF signed with image!');
        this.signedPdf = res.data.signed_file; // assuming backend returns signed file URL
      },
      error: (err) => {
        console.error('Failed to sign PDF with image:', err);
        alert('Failed to sign PDF with image.');
      }
    });
  }

}
