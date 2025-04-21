import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PDF, SignaturePosition } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { PdfUploaderComponent } from "../pdf-uploader/pdf-uploader.component";
import { SignatureChooserComponent } from "../signature-chooser/signature-chooser.component";
import { NgStyle, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment.development';
import * as pdfjsLib from 'pdfjs-dist';
import { ActivatedRoute } from '@angular/router';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';



@Component({
  selector: 'app-pdf-signer',
  standalone: true,
  imports: [PdfUploaderComponent, SignatureChooserComponent, NgStyle, NgIf],
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

  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pdfContainer') pdfContainerRef!: ElementRef<HTMLDivElement>;

  constructor(private pdfService: PdfService,  private route: ActivatedRoute) {
    console.log('PDF Signer Component initialized');
  }



  ngOnInit() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.js';


      console.log('PDF.js worker initialized with src:', pdfjsLib.GlobalWorkerOptions.workerSrc);

    const pdfId = this.route.snapshot.paramMap.get('id');
    if (pdfId) {
      this.pdfService.getPdf(pdfId).subscribe({
        next: (pdf: PDF) => {
          this.handlePdfUploaded(pdf);
        },
        error: () => {
          this.pdfLoadError = 'Failed to fetch PDF from backend';
        }
      });
    }
  }


  // Make sure this method exists with exactly this name
  handlePdfUploaded(pdf: PDF) {
    console.log('PDF received from uploader:', pdf);
    this.uploadedPdf = pdf;
    this.pdfLoadError = null;
    // Build the correct URL depending on your backend structure
    let pdfUrl: string;
    if (pdf.file.startsWith('http')) {
      pdfUrl = pdf.file;
    } else {
    // Clean up any double slashes in the URL
    const apiUrl = environment.API_URL.endsWith('/') ? environment.API_URL : environment.API_URL + '/';
    const pdfPath = pdf.file.startsWith('/') ? pdf.file.substring(1) : pdf.file;
    pdfUrl = apiUrl + pdfPath;
    }
    console.log('Will attempt to render PDF from URL:', pdfUrl);


      // Give ViewChild references time to initialize if they haven't already
      setTimeout(() => {
        if (this.pdfCanvasRef) {
          console.log('Canvas reference found, rendering PDF');
          this.loadAndRenderPDF(pdfUrl);
        } else {
          console.error('Canvas reference not available yet, cannot render PDF');
          this.pdfLoadError = 'Canvas not initialized';
        }
      }, 300);
  }

  loadAndRenderPDF(url: string) {
    if (!this.pdfCanvasRef) {
      this.pdfLoadError = 'Canvas element not available';
      console.error(this.pdfLoadError);
      return;
    }

    const canvas = this.pdfCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    // Check if context is null before proceeding
    if (!ctx) {
      this.pdfLoadError = 'Failed to get 2D context from canvas';
      console.error(this.pdfLoadError);
      return;
    }

    console.log('Loading PDF from:', url);

        // Test the URL with a fetch first to check for CORS issues
        fetch(url, { mode: 'cors' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          console.log('Fetch successful, URL is accessible');

          // Now try loading with PDF.js
          return pdfjsLib.getDocument(url).promise;
        })
        .then(pdfDoc => {
          console.log('PDF document loaded successfully, pages:', pdfDoc.numPages);
          return pdfDoc.getPage(1);
        })
        .then(page => {
          console.log('PDF page loaded successfully');
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          return page.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise;
        })
        .then(() => {
          console.log('PDF rendered successfully on canvas');
          this.pdfLoaded = true;
        })
        .catch(error => {
          this.pdfLoadError = `Error loading PDF: ${error.message}`;
          console.error('PDF load/render error:', error);

          // Try to display error details in the UI
          if (canvas && ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = '16px Arial';
            ctx.fillText(`Error loading PDF: ${error.message}`, 10, 50);
          }
        });



    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      url: url,
      withCredentials: true
    });

    loadingTask.promise.then((pdfDoc) => {
      console.log('PDF loaded successfully, pages:', pdfDoc.numPages);

      // Get the first page
      pdfDoc.getPage(1).then((page) => {
        // Set scale for better viewing
        const viewport = page.getViewport({ scale: 1.5 });

        // Set canvas dimensions to match the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page
        const renderContext = {
          canvasContext: ctx, // Now TypeScript knows ctx is not null
          viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
          console.log('Page rendered successfully');
          this.pdfLoaded = true;
        }).catch((error) => {
          console.error('Error rendering page:', error);
        });
      }).catch((error) => {
        console.error('Error getting PDF page:', error);
      });
    }).catch((error) => {
      console.error('Error loading PDF:', error);

      // Try with CORS headers
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Fetch response:', response);
        // If we got here, the URL is accessible but PDF.js had other issues
      })
      .catch(e => console.error('Fetch error:', e));
    });
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

    const position: SignaturePosition = {
      x: this.signatureX,
      y: this.signatureY,
      width: 100,
      height: 50
    };

    this.pdfService.signPdfWithImage(this.uploadedPdf.id, this.signatureFile, position).subscribe({
      next: (res) => {
        alert('PDF signed successfully!');
        window.location.href = '/home'; // Or use router.navigate
      },
      error: () => alert('Failed to sign PDF.')
    });
  }
}
