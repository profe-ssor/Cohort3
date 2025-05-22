import { Component, OnInit } from '@angular/core';
import { IInbox, IMessage } from '../../model/interface/message';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-received-messages',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, DatePipe],
  templateUrl: './received-messages.component.html',
  styleUrl: './received-messages.component.css'
})
export class ReceivedMessagesComponent implements OnInit {
  receivedMessages: IInbox[] = [];
  loading = false;
  currentUserId: number | null = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private _toastr: ToastrService,
    private router: Router // Add router for navigation
  ) {}

  ngOnInit(): void {
    this.fetchReceivedMessages();
  }

  fetchReceivedMessages(): void {
    this.loading = true;
    this.messageService.getInbox().subscribe({
      next: (res) => {
        this.receivedMessages = res;
        this.loading = false;
      },
      error: (error) => {
        this._toastr.error('Error fetching received messages');
        console.error('Error fetching received messages:', error);
        this.loading = false;
      }
    });
  }

  // NEW: Handle message click to view details
  onMessageClick(message: IInbox): void {

    // Navigate to message detail page
    this.router.navigate(['/message-detail', message.id]);
  }

  // NEW: Mark all messages as read
  markAllAsRead(): void {
    this.messageService.markAllAsRead().subscribe({
      next: (res) => {
        this._toastr.success(res.success);
        // Update local state
        this.receivedMessages.forEach(msg => msg.is_read = true);
      },
      error: (error) => {
        this._toastr.error('Error marking messages as read');
        console.error('Error:', error);
      }
    });
  }

  isUnread(message: IInbox): boolean {
    return !message.is_read;
  }

  getSenderLabel(message: IInbox): string {
    return message.sender_name || 'Unknown';
  }

  // NEW: Get unread count
  getUnreadCount(): number {
    return this.receivedMessages.filter(msg => !msg.is_read).length;
  }
}
