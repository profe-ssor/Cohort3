import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-pdf-uploader',
  standalone: true,
  imports: [NgIf, RouterModule, FormsModule],
  templateUrl: './pdf-uploader.component.html',
  styleUrl: './pdf-uploader.component.css'
})
export class PdfUploaderComponent {
  @Output() pdfUploaded = new EventEmitter<PDF>();
  @Input() showUpload: boolean = true;

  selectedFile: File | null = null;
  fileName: string = '';
  isDragging = false;
  isUploading = false;
  showFileNameInput = false;

  constructor(private pdfService: PdfService, private router: Router) {}

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.prepareFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        this.prepareFile(file);
      } else {
        console.error('Only PDF files are accepted');
        alert('Please drop a PDF file');
      }
    }
  }

  private prepareFile(file: File) {
    if (!file) return;

    this.selectedFile = file;
    this.isUploading = false;

    const defaultName = file.name.replace(/\.[^/.]+$/, "");
    this.fileName = defaultName;
    this.showFileNameInput = true;
  }

  confirmUpload() {
    if (!this.selectedFile) {
      alert('No file selected');
      return;
    }

    if (!this.fileName.trim()) {
      alert('Please enter a valid document name');
      return;
    }

    this.isUploading = true;

    this.pdfService.uploadPdf(this.fileName, this.selectedFile).subscribe({
      next: (res) => {
        // Only handle the final response, not progress events
        if (res.type === HttpEventType.Response) {
          this.isUploading = false;
          this.showFileNameInput = false;
          console.log('Upload response:', res);

          // Try to extract the PDF object robustly
          let uploadedPdf: any = null;
          const body = (res as HttpResponse<any>).body;

          if (body) {
            if (body.data && body.data.id) {
              uploadedPdf = body.data;
            } else if (body.id) {
              uploadedPdf = body;
            }
          }

          if (uploadedPdf && uploadedPdf.id) {
            this.pdfUploaded.emit(uploadedPdf);
            setTimeout(() => {
              this.router.navigate(['/personnel/sign', uploadedPdf.id]);
            }, 1500);
          } else {
            alert('Could not determine uploaded PDF ID! See console for details.');
            console.log('Upload response (no PDF ID found):', res);
          }
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload failed', err);
        alert('Failed to upload PDF');
      }
    });
  }

  cancelUpload() {
    this.selectedFile = null;
    this.fileName = '';
    this.showFileNameInput = false;
    this.isUploading = false;
  }
}
