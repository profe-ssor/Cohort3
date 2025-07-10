import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PDF, PdfUploadResponse } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf, FormsModule,  NgFor,NgClass, DatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  environment = environment
  @Input() showUpload: boolean = true;

     fileName: string = '';
     selectedFile: File | null = null;
   isUploading = false;
     errorMessage = '';
     loading = false;
     error: string | null = null;
     successMessage = '';
     pdfs: PDF[] = [];

     constructor(
       private pdfService: PdfService,
       private router: Router
     ) { }

     ngOnInit(): void {
      this.loadPdfs();
     }

     onFileSelect(event: any): void {
       const file = event.target.files[0];
       if (file) {
         if (file.type !== 'application/pdf') {
           this.errorMessage = 'Please select a PDF file.';
           this.selectedFile = null;
           return;
         }

         this.selectedFile = file;

         // Auto-fill the filename field
         const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
         this.fileName = nameWithoutExtension;

         this.errorMessage = '';
       }
     }

     saveFile(): void {
       if (!this.selectedFile) {
         this.errorMessage = 'Please select a file to upload.';
         return;
       }

       if (!this.fileName.trim()) {
         this.errorMessage = 'Please enter a document name.';
         return;
       }

       this.isUploading = true;
       this.errorMessage = '';
       this.successMessage = '';

       this.pdfService.uploadPdf(this.fileName, this.selectedFile).subscribe({
         next: (event: HttpEvent<PdfUploadResponse>) => {
           if (event.type === HttpEventType.Response) { // HttpEventType.Response
             const response = event.body as PdfUploadResponse;
           this.successMessage = response.message || 'File uploaded successfully!';
           this.isUploading = false;

             // Navigate to home page after short delay
             setTimeout(() => {
               this.router.navigate(['/persneldashboard']);
             }, 1500);
           }
         },
         error: (err) => {
           this.isUploading = false;
           this.errorMessage = err.error?.error || 'An error occurred while uploading the file.';
         }
       });
     }

     clearSelection(): void {
       this.selectedFile = null;
       this.fileName = '';
       this.errorMessage = '';
       this.successMessage = '';
     }
// list all pdf
     loadPdfs(): void {
      this.loading = true;
      console.log('🔄 Loading PDFs for footer component...');

      this.pdfService.getPdfs()
        .subscribe({
          next: (data) => {
            console.log('✅ PDFs loaded successfully:', data);
            this.pdfs = data;
            this.loading = false;

            // Log details about each PDF
            if (data && data.length > 0) {
              console.log(`📄 Found ${data.length} PDFs:`);
              data.forEach((pdf, index) => {
                console.log(`  ${index + 1}. ID: ${pdf.id}, Name: ${pdf.file_name}, Signed: ${pdf.is_signed}`);
              });
            } else {
              console.log('❌ No PDFs found in response');
            }
          },
          error: (err) => {
            console.error('❌ Error loading PDFs:', err);
            this.error = 'Failed to load PDFs';
            this.loading = false;
          }
        });
    }

}
