import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IInbox, IMessage, IMessageSendResponse, InboxResponse } from '../model/interface/message';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) {}

  sendMessage(messageData: any): Observable<IMessageSendResponse> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must be authenticated to send messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<IMessageSendResponse>(
      `${environment.API_URL}messageApp/send-message/`,
      messageData,
      { headers }
    );
  }

  getInbox(): Observable<IInbox[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to access inbox.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IInbox[]>(
      `${environment.API_URL}messageApp/inbox/`,
      { headers }
    );
  }

  getSentMessages(): Observable<IMessage[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to access sent messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IMessage[]>(
      `${environment.API_URL}messageApp/sent-messages/`,
      { headers }
    );
  }

  getUnreadMessages(): Observable<IMessage[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to access unread messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IMessage[]>(
      `${environment.API_URL}messageApp/unread-messages/`,
      { headers }
    );
  }

  // NEW: View message endpoint that marks it as read
  viewMessage(id: number): Observable<IInbox> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to view messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IInbox>(
      `${environment.API_URL}messageApp/view-message/${id}/`,
      { headers }
    );
  }

  // Keep the old method for backward compatibility
  getMessageById(id: number): Observable<IMessage> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to access messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IMessage>(
      `${environment.API_URL}messageApp/messages/${id}`,
      { headers }
    );
  }

  markAsRead(messageId: number): Observable<{ success: string }> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to mark messages as read.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ success: string }>(
      `${environment.API_URL}messageApp/mark-message-read/${messageId}/`,
      {},
      { headers }
    );
  }

  // NEW: Mark all messages as read
  markAllAsRead(): Observable<{ success: string }> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to mark messages as read.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ success: string }>(
      `${environment.API_URL}messageApp/mark-all-read/`,
      {},
      { headers }
    );
  }

  // NEW: Get replies for a message
  getReplies(messageId: number): Observable<IInbox[]> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to access replies.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IInbox[]>(
      `${environment.API_URL}messageApp/message/${messageId}/replies/`,
      { headers }
    );
  }

  deleteMessage(messageId: number): Observable<{ success: string }> {
    const token = this.getJwtToken();
    if (!token) {
      console.error("User must authenticated to delete messages.");
      return throwError(() => new Error("Unauthorized"));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<{ success: string }>(
      `${environment.API_URL}messageApp/delete-message/${messageId}/`,
      { headers }
    );
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
