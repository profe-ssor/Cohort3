import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PDF, SignaturePosition } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { PdfUploaderComponent } from "../pdf-uploader/pdf-uploader.component";
import { SignatureChooserComponent } from "../signature-chooser/signature-chooser.component";
import { NgStyle, NgIf, NgFor } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import { ActivatedRoute, Router } from '@angular/router';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs';
import { FormsModule } from '@angular/forms';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

@Component({
  selector: 'app-pdf-signer',
  standalone: true,
  imports: [FormsModule, SignatureChooserComponent, NgStyle, NgIf],
  templateUrl: './pdf-signer.component.html',
  styleUrl: './pdf-signer.component.css'
})
export class PdfSignerComponent implements OnInit {
  environment = environment;
  uploadedPdf: PDF | null = null;
  signatureFile: File | null = null;
  signatureUrl: string | null = null;
  signatureX = 50;
  signatureY = 50;
  isDragging = false;
  offsetX = 0;
  offsetY = 0;
  pdfLoaded = false;
  pdfLoadError: string | null = null;
  pageCount = 0;
  selectedSignaturePage = 1;

  renderedPdfHeight = 0;
  renderedPdfWidth = 0;


  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContainer') pdfContainerRef!: ElementRef<HTMLDivElement>;

  constructor(private pdfService: PdfService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const pdfId = this.route.snapshot.paramMap.get('id');
    if (pdfId) {
      this.pdfService.getPdf(pdfId).subscribe({
        next: (pdf: PDF) => this.handlePdfUploaded(pdf),
        error: () => this.pdfLoadError = 'Failed to fetch PDF from backend'
      });
    }
  }

  handlePdfUploaded(pdf: PDF) {
    this.uploadedPdf = pdf;
    this.pdfLoadError = null;

    const apiUrl = environment.API_URL.endsWith('/') ? environment.API_URL : environment.API_URL + '/';
    const pdfPath = pdf.file.startsWith('/') ? pdf.file.substring(1) : pdf.file;
    const pdfUrl = pdf.file.startsWith('http') ? pdf.file : apiUrl + pdfPath;

    setTimeout(() => {
      if (this.pdfCanvasRef) {
        this.loadAndRenderPDF(pdfUrl, this.selectedSignaturePage);
      } else {
        this.pdfLoadError = 'Canvas not initialized';
      }
    }, 1000);
  }

  async loadAndRenderPDF(url: string, pageNumber: number = 1) {
    try {
      const canvas = this.pdfCanvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const pdfDoc = await getDocument(url).promise;
      this.pageCount = pdfDoc.numPages;

      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      this.renderedPdfHeight = viewport.height;
      this.renderedPdfWidth = viewport.width;

      await page.render({ canvasContext: ctx, viewport }).promise;
      this.pdfLoaded = true;
    } catch (error) {
      this.pdfLoadError = `Error loading PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  onPageChange(page: number) {
    this.selectedSignaturePage = page;
    if (this.uploadedPdf) {
      const apiUrl = environment.API_URL.endsWith('/') ? environment.API_URL : environment.API_URL + '/';
      const pdfPath = this.uploadedPdf.file.startsWith('/') ? this.uploadedPdf.file.substring(1) : this.uploadedPdf.file;
      const pdfUrl = this.uploadedPdf.file.startsWith('http') ? this.uploadedPdf.file : apiUrl + pdfPath;
      this.loadAndRenderPDF(pdfUrl, page);
    }
  }

  handleSignatureReady(data: { type: string, file: File }) {
    this.signatureFile = data.file;
    this.signatureUrl = URL.createObjectURL(data.file);
  }

  startDragging(event: MouseEvent) {
    this.isDragging = true;
    this.offsetX = event.offsetX;
    this.offsetY = event.offsetY;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.stopDragging);
  }

  onMouseMove = (event: MouseEvent) => {
    const rect = this.pdfContainerRef.nativeElement.getBoundingClientRect();
    if (this.isDragging) {
      this.signatureX = event.clientX - rect.left - this.offsetX;
      this.signatureY = event.clientY - rect.top - this.offsetY;
    }
  };

  stopDragging = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
  };

  finishSigning() {
    if (!this.uploadedPdf || !this.signatureFile) return;

        // Adjust Y coordinate from canvas space (top-left origin) to PDF (bottom-left origin)
        const adjustedY = this.renderedPdfHeight - this.signatureY - 50;

    const position: SignaturePosition = {
      x: this.signatureX,
      y: this.signatureY,
      width: 100,
      height: 50,
      page: this.selectedSignaturePage
    };

    this.pdfService.signPdfWithImage(this.uploadedPdf.id, this.signatureFile, position).subscribe({
      next: () => {
        alert('PDF signed successfully!');
        this.router.navigate(['/personnel/footer']);
      },
      error: () => alert('Failed to sign PDF.')
    });
  }
}
