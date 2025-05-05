import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
        this.isUploading = false;
        this.showFileNameInput = false;
        if ('body' in res && res.body) {
          const uploadedPdf = res.body.data;
          console.log('Upload success:', uploadedPdf);

          this.pdfUploaded.emit(uploadedPdf);
          setTimeout(() => {
            this.router.navigate(['/sign', uploadedPdf.id]);
          }, 1500);
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
