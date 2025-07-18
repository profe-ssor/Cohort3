import { HttpClient, HttpEvent, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PDF, PdfSignResponse, PdfUploadResponse, SignaturePosition } from '../model/interface/pdf';
import { map, Observable, tap } from 'rxjs';
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
      console.log('🔑 PDF Service: Token check -', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found');

      if (!token){
        console.error("user must logged before access to pdf.");
        return new Observable<PDF[]>(observer => observer.error({ error: "Unauthorised"}));
      }
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      console.log('🔄 PDF Service: Calling getPdfs() endpoint');
      console.log('🌐 PDF Service: URL:', `${environment.API_URL}file_uploads/pdf/list/`);

      return this.http.get<PDF[]>(`${environment.API_URL}file_uploads/pdf/list/`,  {headers}).pipe(
        tap({
          next: (data) => {
            console.log('✅ PDF Service: getPdfs() response received:', data);
            console.log(`📄 PDF Service: Found ${data?.length || 0} PDFs`);
          },
          error: (err) => {
            console.error('❌ PDF Service: getPdfs() error:', err);
          }
        })
      );
    }
    // get pdf file by id
    getPdf(id: string): Observable<PDF>{
      const token = this.getJwtToken();
      if (!token){
        console.error("user must logged before access to pdf.")
        return new Observable<PDF>(observer => observer.error({ error: "Unauthorised"}));
      }
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<PDF>(`${environment.API_URL}file_uploads/pdf/${id}/`, {headers});
    }

    // upload new pdf file
    uploadPdf(fileName: string, file: File): Observable<HttpEvent<PdfUploadResponse>> {
      const token = this.getJwtToken();
      if (!token) {
        console.error('User must be logged in before accessing PDF features.');
        return new Observable<HttpEvent<PdfUploadResponse>>(observer =>
          observer.error({ error: 'Unauthorized' })
        );
      }

      const formData = new FormData();
      formData.append('file_name', fileName);
      formData.append('file', file);

      const req = new HttpRequest('POST', `${environment.API_URL}file_uploads/pdf/upload/`, formData, {
        reportProgress: true,
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      });


      return this.http.request(req).pipe(
        tap({
          next: (response: HttpEvent<any>) => {
            if (response instanceof HttpResponse) {
              const pdfResponse = response.body as PdfUploadResponse;
              console.log('PDF uploaded successfully:', pdfResponse.message);
              console.log('Uploaded PDF Data:', pdfResponse.data);


            }
          },
          error: (err) => {
            console.error('Error uploading PDF:', err);
          },
        })
      );
    }

    signPdfWithImage(pdfId: number, signature: File, position: SignaturePosition): Observable<PdfSignResponse> {
      const formData = new FormData();
      formData.append('signature', signature);
      formData.append('position', JSON.stringify(position));

      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getJwtToken()!}`);
      const role = (localStorage.getItem('userRole') || '').toLowerCase();
      let endpoint = '';
      if (role.includes('supervisor')) {
        endpoint = `${environment.API_URL}file_uploads/pdf/sign/supervisor/${pdfId}/`;
      } else if (role.includes('admin')) {
        endpoint = `${environment.API_URL}file_uploads/pdf/sign/admin/${pdfId}/`;
      } else if (role.includes('nss') || role.includes('user')) { // Accept both 'nss' and 'user'
        endpoint = `${environment.API_URL}file_uploads/pdf/sign/nss/${pdfId}/`;
      } else {
        throw new Error('User role not recognized. Cannot sign PDF.');
      }
      return this.http.post<PdfSignResponse>(endpoint, formData, { headers });
    }

 // Returns a list of all PDFs that have been signed by the current authenticated user.
 getSignedPdfs(): Observable<PDF[]> {
  const token = this.getJwtToken();
  if (!token) {
    console.error("User must be logged in before accessing signed PDFs.");
    return new Observable<PDF[]>(observer => observer.error({ error: "Unauthorised" }));
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<PdfSignResponse | PDF[]>(`${environment.API_URL}file_uploads/signed/`, { headers }).pipe(
    map(response => {
      // Handle both array responses and object responses with data property
      if (Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        console.error('Unexpected response format:', response);
        return [];
      }
    })
  );
}

// Upload Evaluation Form with form_type and priority
SendEvaluationForm(
  fileName: string,
  file: File,
  formType: string,
  priority: string,
  receiverId: number

  ): Observable<HttpEvent<PdfUploadResponse>> {
    const token = this.getJwtToken();
    if (!token) return new Observable(observer => observer.error({ error: 'Unauthorized' }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', fileName);
    formData.append('form_type', formType);
    formData.append('priority', priority);
    formData.append('receiver_id', receiverId.toString());

    const req = new HttpRequest('POST', `${environment.API_URL}file_uploads/evaluation-form/send/`, formData, {
      reportProgress: true,
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    });

    return this.http.request(req);
  }

  getEvaluationForms(formType?: string): Observable<PDF[]> {
    const token = this.getJwtToken();
    if (!token) return new Observable(observer => observer.error({ error: "Unauthorised" }));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let url = `${environment.API_URL}file_uploads/evaluation-forms/`;
    if (formType) url += `?form_type=${formType}`;

    return this.http.get<{ data: PDF[] }>(url, { headers }).pipe(map(res => res.data));
  }

  getReceivedEvaluationForms(formType?: string): Observable<PDF[]> {
    const token = this.getJwtToken();
    if (!token) return new Observable(observer => observer.error({ error: "Unauthorised" }));
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let url = `${environment.API_URL}file_uploads/evaluation-forms/received/`;
    if (formType) url += `?form_type=${formType}`;

    return this.http.get<{ data: PDF[] }>(url, { headers }).pipe(map(res => res.data));
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

  updateEvaluationStatus(pdfId: number, status: 'pending' | 'approved' | 'rejected' | 'under_review'): Observable<PDF> {
  const token = this.getJwtToken();
  if (!token) return new Observable(observer => observer.error({ error: 'Unauthorized' }));

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const body = { status };

  return this.http.patch<{ data: PDF }>(
    `${environment.API_URL}file_uploads/evaluation-forms/${pdfId}/update-status/`,
    body,
    { headers }
  ).pipe(map(response => response.data));
}

updateAdminPdfFormStatus(pdfId: number, status: 'pending' | 'approved' | 'rejected' | 'under_review'): Observable<PDF> {
  const token = this.getJwtToken();
  if (!token) return new Observable(observer => observer.error({ error: 'Unauthorized' }));
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const body = { status };
  return this.http.patch<{ data: PDF }>(
    `${environment.API_URL}file_uploads/admin/evaluation-forms/${pdfId}/update-status/`,
    body,
    { headers }
  ).pipe(map(response => response.data));
}

}

