import { Component, EventEmitter, Output } from '@angular/core';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-pdf-uploader',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './pdf-uploader.component.html',
  styleUrl: './pdf-uploader.component.css'
})
export class PdfUploaderComponent {
  @Output() pdfUploaded = new EventEmitter<PDF>();
  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;

  constructor(private pdfService: PdfService, private router: Router) {}

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
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
        this.processFile(file);
      } else {
        console.error('Only PDF files are accepted');
        alert('Please drop a PDF file');
      }
    }
  }

  private processFile(file: File) {
    if (!file) return;

    this.selectedFile = file;
    this.isUploading = true;
    console.log('Uploading file:', file.name);

    this.pdfService.uploadPdf(file.name, file).subscribe({
      next: (res) => {
        this.isUploading = false;
        if ('body' in res && res.body) {
          const uploadedPdf = res.body.data;
          console.log('Upload success:', uploadedPdf);
          // Navigate to PDF signer with the uploaded PDF ID
    this.router.navigate(['/sign', uploadedPdf.id]);
        }

      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload failed', err);
        alert('Failed to upload PDF');
      }
    });
  }
}
