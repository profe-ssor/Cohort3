import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IAvailableRecipient, IMessage } from '../../../model/interface/message';
import { MessageService } from '../../../services/message.service';
import { DashboardService } from '../../../services/admin-services/dashboard.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {
  selectedCategory = signal<string>('all');
  searchQuery = '';
  showComposeModal = false;

  messages = signal<IMessage[]>([]);
  recipients = signal<IAvailableRecipient[]>([]);


  composeForm = {
    recipient: '',
    subject: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    message_type: 'inquiry' as 'inquiry' | 'report' | 'feedback',
    content: ''
  };

  constructor(
    private messageService: MessageService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
    this.loadRecipients();
  }

  loadMessages() {
    this.messageService.getInbox().subscribe({
      next: (data) => {
        this.messages.set(
          data.map((inbox: any) => ({
            ...inbox,
            subject: inbox.subject ?? '',
            is_today: inbox.is_today ?? false
          }))
        ); // Map IInbox[] to IMessage[]
 // Match your InboxResponse interface
      },
      error: (err) => {
        console.error('Error loading messages:', err);
      }
    });
  }
 loadRecipients() {
    this.messageService.getAvailableRecipients().subscribe({
      next: (data) => this.recipients.set(data),
      error: (err) => console.error('Failed to load recipients:', err)
    });
  }

  filteredMessages = computed(() => {
    let filtered = this.messages();

    const category = this.selectedCategory();
    if (category !== 'all') {
      if (category === 'unread') {
        filtered = filtered.filter(m => !m.is_read);
      } else {
        filtered = filtered.filter(m => m.message_type === category);
      }
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.subject?.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query) ||
        m.sender_name.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });
applyFilters() {
  // No need to do anything; computed() handles reactivity
}
  totalMessages = computed(() => this.messages().length);
  unreadCount = computed(() => this.messages().filter(m => !m.is_read).length);
  highPriorityCount = computed(() => this.messages().filter(m => m.priority === 'high').length);
  todayCount = computed(() => this.messages().filter(m => m.is_today).length);

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      supervisor: 'Supervisor',
      personnel: 'NSS Personnel'
    };
    return roleMap[role] || role;
  }

  getTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      inquiry: 'Inquiry',
      report: 'Report',
      feedback: 'Feedback'
    };
    return typeMap[type] || type;
  }

  getRelativeTime(timestamp: string | Date): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  }

  getMessagePreview(content: string): string {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  }

  selectMessage(message: IMessage) {
    if (!message.is_read) {
      this.messageService.markAsRead(message.id).subscribe({
        next: () => {
          this.messages.update(msgs =>
            msgs.map(m => m.id === message.id ? { ...m, is_read: true } : m)
          );
        }
      });
    }

    console.log('Selected message:', message.subject);
  }

  replyToMessage(message: IMessage) {
    this.composeForm = {
      recipient: message.sender.toString(),
      subject: `Re: ${message.subject}`,
      priority: 'medium',
      message_type: 'feedback',
      content: ''
    };
    this.showComposeModal = true;
  }

  forwardMessage(message: IMessage) {
    this.composeForm = {
      recipient: '',
      subject: `Fwd: ${message.subject}`,
      priority: message.priority,
      message_type: message.message_type,
      content: `\n\n--- Forwarded Message ---\nFrom: ${message.sender_name}\nSubject: ${message.subject}\n\n${message.content}`
    };
    this.showComposeModal = true;
  }

  deleteMessage(message: IMessage) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.messageService.deleteMessage(message.id).subscribe({
        next: () => {
          this.messages.update(msgs => msgs.filter(m => m.id !== message.id));
        },
        error: (err) => console.error('Failed to delete message:', err)
      });
    }
  }

  markAllAsRead() {
    this.messageService.markAllAsRead().subscribe({
      next: () => {
        this.messages.update(msgs =>
          msgs.map(m => ({ ...m, is_read: true }))
        );
      }
    });
  }

  sendMessage() {
    if (!this.composeForm.recipient || !this.composeForm.subject || !this.composeForm.content) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = {
      receiver: Number(this.composeForm.recipient),
      subject: this.composeForm.subject,
      content: this.composeForm.content,
      priority: this.composeForm.priority,
      message_type: this.composeForm.message_type
    };

    this.messageService.sendMessage(payload).subscribe({
      next: (response) => {
        this.composeForm = {
          recipient: '',
          subject: '',
          priority: 'medium',
          message_type: 'inquiry',
          content: ''
        };
        this.showComposeModal = false;
        this.loadMessages();
        this.dashboardService.refreshActivityFeed();
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        alert('Failed to send message.');
      }
    });
  }

  getTypeCount(type: string): number {
    return this.messages().filter(m => m.message_type === type).length;
  }

  refreshMessages() {
    this.loadMessages();
  }
}
