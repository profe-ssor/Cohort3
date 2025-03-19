import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PDF, PdfSignResponse, PdfUploadResponse, SignaturePosition } from '../model/interface/pdf';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class PdfService {
   constructor(
      private http: HttpClient,
      private router: Router
    ) { }

    // get all pdf files
    getPdfs(): Observable<PDF[]>{
      return this.http.get<PDF[]>(`${environment.API_URL}/pdf/list/`);
    }
    // get pdf file by id
    getPdf(id: number): Observable<PDF>{
      return this.http.get<PDF>(`${environment.API_URL}/pdf/${id}/`);
    }

    // upload new pdf file
  uploadPdf(fileName: string, file: File): Observable<HttpEvent<PdfUploadResponse>> {
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('pdf', file);

    const req = new HttpRequest('POST', `${environment.API_URL}/pdf/upload/`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }
   // Sign PDF with drawing
   signPdfWithDrawing(pdfId: number, signatureData: string, position?: SignaturePosition): Observable<PdfSignResponse> {
    const data: any = {
      signature: signatureData
    };

    if (position) {
      data.position = position;
    }

    return this.http.post<PdfSignResponse>(`${environment.API_URL}/pdf/sign/draw/${pdfId}/`, data);
  }


  storeJwtToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getJwtToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }
}

