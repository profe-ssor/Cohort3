import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
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
      const token = this.getJwtToken();
      if (!token){
        console.error("user must logged before access to pdf.");
        return new Observable<PDF[]>(observer => observer.error({ error: "Unauthorised"}));
      }
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<PDF[]>(`${environment.API_URL}/pdf/list/`,  {headers});
    }
    // get pdf file by id
    getPdf(id: number): Observable<PDF>{
      const token = this.getJwtToken();
      if (!token){
        console.error("user must logged before access to pdf.")
        return new Observable<PDF>(observer => observer.error({ error: "Unauthorised"}));
      }
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<PDF>(`${environment.API_URL}/pdf/${id}/`, {headers});
    }

    // upload new pdf file

    uploadPdf(fileName: string, file: File): Observable<HttpEvent<PdfUploadResponse>> {
      const token = this.getJwtToken();
      if (!token) {
        console.error("User must be logged in before accessing PDF features.");
        return new Observable<HttpEvent<PdfUploadResponse>>(observer =>
          observer.error({ error: "Unauthorized" })
        );
      }

      const formData = new FormData();
      formData.append('file_name', fileName);
      formData.append('pdf', file);

      // Include the token in the request headers
      const req = new HttpRequest('POST', `${environment.API_URL}/pdf/upload/`, formData, {
        reportProgress: true,
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
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

