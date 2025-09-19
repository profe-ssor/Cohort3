import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PDF, SignaturePosition } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { PdfUploaderComponent } from "../pdf-uploader/pdf-uploader.component";
import { SignatureChooserComponent } from "../signature-chooser/signature-chooser.component";
import { NgStyle, NgIf, NgFor } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Import PDF.js with proper typing
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source
let isPdfJsInitialized = false;

async function initializePdfJs() {
  if (!isPdfJsInitialized) {
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
    const pdfjsWorkerSrc = URL.createObjectURL(
      new Blob([pdfjsWorker.default], { type: 'application/javascript' })
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
    isPdfJsInitialized = true;
  }
  return pdfjsLib;
}

// Initialize PDF.js when the component loads
const pdfjsPromise = initializePdfJs();

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

  signatureWidth = 100;
  signatureHeight = 50;
  isResizing = false;
  resizeStartX = 0;
  resizeStartY = 0;
  initialWidth = 100;
  initialHeight = 50;


  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContainer') pdfContainerRef!: ElementRef<HTMLDivElement>;

  constructor(public pdfService: PdfService, public route: ActivatedRoute, public router: Router, public toastr: ToastrService) {}

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

    const apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';
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

      this.pdfLoadError = null;
      
      const pdfjs = await pdfjsPromise;
      
      // Add cache buster to prevent caching issues
      const cacheBuster = `?t=${Date.now()}`;
      const pdfUrl = url.includes('?') ? `${url}&${cacheBuster.substring(1)}` : `${url}${cacheBuster}`;
      
      try {
        // First, check if the URL is accessible
        const response = await fetch(pdfUrl, {
          method: 'HEAD',
          credentials: 'include',
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error checking PDF URL:', error);
        throw new Error(`Cannot access PDF at ${url}. Please check the URL and CORS settings.`);
      }
      
      // Add credentials if needed for CORS
      const loadingTask = pdfjs.getDocument({
        url: pdfUrl,
        withCredentials: true,  // Include credentials for CORS
        cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      // Set up error handling for the loading task
      loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
        console.log(`Loading PDF: ${Math.round(progress.loaded / progress.total * 100)}%`);
      };
      
      const pdfDoc = await loadingTask.promise;
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
      const apiUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl : environment.apiUrl + '/';
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

  startResizing(event: MouseEvent) {
    event.stopPropagation();
    this.isResizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.initialWidth = this.signatureWidth;
    this.initialHeight = this.signatureHeight;
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.stopResizing);
  }

  onResizeMove = (event: MouseEvent) => {
    if (this.isResizing) {
      const dx = event.clientX - this.resizeStartX;
      const dy = event.clientY - this.resizeStartY;
      this.signatureWidth = Math.max(30, this.initialWidth + dx);
      this.signatureHeight = Math.max(15, this.initialHeight + dy);
    }
  };

  stopResizing = () => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.stopResizing);
  };

  onPdfCanvasClick(event: MouseEvent) {
    if (!this.pdfCanvasRef) return;
    const rect = this.pdfCanvasRef.nativeElement.getBoundingClientRect();
    // Center the signature at the click point
    this.signatureX = event.clientX - rect.left - 50; // 50 = half width
    this.signatureY = event.clientY - rect.top - 25;  // 25 = half height
  }

  finishSigning() {
    if (!this.uploadedPdf || !this.signatureFile) return;

    // Adjust Y coordinate from canvas space (top-left origin) to PDF (bottom-left origin)
    const adjustedY = this.renderedPdfHeight - this.signatureY - this.signatureHeight;

    const position: SignaturePosition = {
      x: this.signatureX,
      y: this.signatureY,
      width: this.signatureWidth,
      height: this.signatureHeight,
      page: this.selectedSignaturePage
    };

    this.pdfService.signPdfWithImage(this.uploadedPdf.id, this.signatureFile, position).subscribe({
      next: () => {
        if (this.toastr) {
          this.toastr.success('PDF signed successfully!');
        }
        const role = (localStorage.getItem('userRole') || '').toLowerCase();
        if (role.includes('admin')) {
          this.router.navigate(['/admin-dashboard/evaluations']);
        } else if (role.includes('supervisor')) {
          this.router.navigate(['/supervisor-dashboard/evaluations']);
        } else if (role.includes('nss') || role.includes('user')) {
          this.router.navigate(['/personnel/persneldashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        if (this.toastr) {
          this.toastr.error('Failed to sign PDF.');
        }
      }
    });
  }
}
