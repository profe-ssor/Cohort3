import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { IInbox } from '../../model/interface/message';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [NgIf, FormsModule, DatePipe],
  templateUrl: './message-detail.component.html',
  styleUrl: './message-detail.component.css'
})
export class MessageDetailComponent implements OnInit {
  messageId: number | null = null;
  message: IInbox | null = null;
  replyContent: string = '';
  sending: boolean = false;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.messageId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.messageId) {
      this.loadMessage();
    }
  }

  // NEW: Use viewMessage instead of getMessageById to automatically mark as read
  loadMessage(): void {
    if (!this.messageId) return;

    this.loading = true;
    this.messageService.viewMessage(this.messageId).subscribe({
      next: (res) => {
        this.message = res;
        this.loading = false;
        // Show success message if it was marked as read
        if (res.is_read) {
          this.toastr.info('Message marked as read');
        }
      },
      error: (err) => {
        console.error('Failed to load message:', err);
        this.toastr.error('Failed to load message');
        this.loading = false;
      }
    });
  }

  sendReply(): void {
    if (!this.message || !this.replyContent.trim()) {
      this.toastr.warning('Please enter a reply message');
      return;
    }

    this.sending = true;

    // NEW: Include reply_to field to link the reply to original message
    const replyData = {
      receiver: this.message.sender, // Send reply to original sender
      content: this.replyContent.trim(),
      reply_to: this.message.id // Link to original message
    };

    this.messageService.sendMessage(replyData).subscribe({
      next: (res) => {
        this.toastr.success('Reply sent successfully!');
        this.replyContent = '';
        this.sending = false;

        // Optionally refresh the message to show updated status
        this.loadMessage();
      },
      error: (err) => {
        console.error('Failed to send reply:', err);
        this.toastr.error('Failed to send reply');
        this.sending = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/inbox']);
  }

  deleteMessage(): void {
    if (!this.message) return;

    if (confirm('Are you sure you want to delete this message?')) {
      this.messageService.deleteMessage(this.message.id).subscribe({
        next: (res) => {
          this.toastr.success('Message deleted successfully');
          this.goBack();
        },
        error: (err) => {
          console.error('Failed to delete message:', err);
          this.toastr.error('Failed to delete message');
        }
      });
    }
  }
}
