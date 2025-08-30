import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  IInbox,
  IMessage,
  IMessageSendResponse,
  IReplyPayload,
  IForwardPayload,
  IAvailableRecipient,
  IMessageStats
} from '../model/interface/message';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getJwtToken();
    if (!token) {
      throw new Error("Unauthorized: No token found");
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  sendMessage(messageData: any): Observable<IMessageSendResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<IMessageSendResponse>(
      `${environment.apiUrl}messageApp/send-message/`,
      messageData,
      { headers }
    );
  }

  replyToMessage(messageId: number, replyData: IReplyPayload): Observable<IMessageSendResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<IMessageSendResponse>(
      `${environment.apiUrl}messageApp/reply-message/${messageId}/`,
      replyData,
      { headers }
    );
  }

  forwardMessage(messageId: number, forwardData: IForwardPayload): Observable<IMessageSendResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<IMessageSendResponse>(
      `${environment.apiUrl}messageApp/forward-message/${messageId}/`,
      forwardData,
      { headers }
    );
  }

  getInbox(): Observable<IInbox[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<IInbox[]>(
      `${environment.apiUrl}messageApp/inbox/`,
      { headers }
    );
  }

  getSentMessages(): Observable<IMessage[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<IMessage[]>(
      `${environment.apiUrl}messageApp/sent-messages/`,
      { headers }
    );
  }

  getUnreadMessages(): Observable<IMessage[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<IMessage[]>(
      `${environment.apiUrl}messageApp/unread-messages/`,
      { headers }
    );
  }

  getMessageById(id: number): Observable<IMessage> {
    const headers = this.getAuthHeaders();
    return this.http.get<IMessage>(
      `${environment.apiUrl}messageApp/messages/${id}`,
      { headers }
    );
  }

  viewMessage(id: number): Observable<IInbox> {
    const headers = this.getAuthHeaders();
    return this.http.get<IInbox>(
      `${environment.apiUrl}messageApp/view-message/${id}/`,
      { headers }
    );
  }

  getReplies(messageId: number): Observable<IInbox[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<IInbox[]>(
      `${environment.apiUrl}messageApp/message/${messageId}/replies/`,
      { headers }
    );
  }

  markAsRead(messageId: number): Observable<{ success: string }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: string }>(
      `${environment.apiUrl}messageApp/mark-message-read/${messageId}/`,
      {},
      { headers }
    );
  }

  markAllAsRead(): Observable<{ success: string }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: string }>(
      `${environment.apiUrl}messageApp/mark-all-read/`,
      {},
      { headers }
    );
  }

  deleteMessage(messageId: number): Observable<{ success: string }> {
    const headers = this.getAuthHeaders();
    return this.http.delete<{ success: string }>(
      `${environment.apiUrl}messageApp/delete-message/${messageId}/`,
      { headers }
    );
  }

  filterMessagesByType(type: string): Observable<IMessage[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<IMessage[]>(
      `${environment.apiUrl}messageApp/messages/filter/?type=${type}`,
      { headers }
    );
  }

  getAvailableRecipients(): Observable<IAvailableRecipient[]> {
    const headers = this.getAuthHeaders();
  return this.http.get<IAvailableRecipient[]>(`${environment.apiUrl}messageApp/available-recipients/`,   { headers });
}

  getMessageStats(): Observable<IMessageStats> {
    const headers = this.getAuthHeaders();
    return this.http.get<IMessageStats>(`${environment.apiUrl}/messageApp/stats/`, { headers });
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
