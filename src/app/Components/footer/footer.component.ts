import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PDF } from '../../model/interface/pdf';
import { PdfService } from '../../services/pdf.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
    pdfs: PDF[] = [];
    loading = false;
    error: string | null = null;


    constructor(private pdfService: PdfService, private router: Router){}
    ngOnInit(): void {
      this.loadPdfs();
    }


    loadPdfs(): void {
      this.loading = true;
      this.pdfService.getPdfs()
        .subscribe({
          next: (data) => {
            this.pdfs = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load PDFs';
            this.loading = false;
            console.error(err);
          }
        });
    }
}
