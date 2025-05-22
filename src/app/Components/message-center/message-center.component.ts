import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IMessage } from '../../model/interface/message';
import { PDF } from '../../model/interface/pdf';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { PdfService } from '../../services/pdf.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-message-center',
  standalone: true,
  imports: [DatePipe, NgFor, FormsModule, NgClass, NgIf],
  templateUrl: './message-center.component.html',
  styleUrl: './message-center.component.css'
})
export class MessageCenterComponent implements OnInit {
  currentUser: any = null;
  messages: IMessage[] = [];
  signedPdfs: PDF[] = [];
  messageText = '';
  selectedPdfId: number | null = null;
  receiverId: number | null = null;
  receiverName: string | null = null;
  fromName: string = '';

  constructor(
    private messageService: MessageService,
    private pdfService: PdfService,
    private authService: AuthService,
    private _toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Log that the component is initializing
    console.log('MessageCenterComponent initializing');

    // Get the receiver information from URL params first
    this.route.queryParams.subscribe((params) => {
      console.log('Query params received:', params);
      if (params['receiverId']) {
        this.receiverId = +params['receiverId'];
        this.receiverName = params['receiverName'];
        console.log(`Receiver set to: ${this.receiverName} (ID: ${this.receiverId})`);
      } else {
        console.log('No receiverId found in query params');
      }
    });
    // Then load messages and other data
    this.currentUser = this.authService.getUser();
    console.log('Current user:', this.currentUser);
    this.fromName = this.currentUser?.full_name || 'Me';


    // this.loadMessages();
    this.loadSignedPdfs();
  }

  getTargetUserId(): number {
    // Always log which ID is being used for sending
    const userId = this.receiverId || 1;
    console.log(`Using receiver ID: ${userId} for message`);
    return userId;
  }

  // loadMessages() {
  //   this.messageService.getInbox().subscribe({
  //     next: (data) => {
  //       console.log('Inbox data:', data);
  //       // Fix: Ensure we're always working with an array
  //       if (Array.isArray(data)) {
  //         this.messages = data;
  //       } else if (data && typeof data === 'object' && 'inbox' in data) {
  //         this.messages = Array.isArray(data.inbox) ? data.inbox : [];
  //       } else {
  //         console.error('Unexpected data format:', data);
  //         this.messages = [];
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error loading messages:', err);
  //     this._toastr.error('Failed to load messages');
  //     }
  //   });
  // }

  loadSignedPdfs() {
    this.pdfService.getSignedPdfs().subscribe({
      next: (data: { data?: PDF[] } | PDF[]) => {
        // Fix: Make sure we handle the response structure correctly
        if (Array.isArray(data)) {
          this.signedPdfs = data;
        } else if (data && typeof data === 'object' && 'data' in data) {
          this.signedPdfs = Array.isArray(data.data) ? data.data : [];
        } else {
          console.error('Unexpected PDF data format:', data);
          this.signedPdfs = [];
        }
      },
      error: (err) => {
        console.error('Error loading signed PDFs:', err);
        this._toastr.error('Failed to load PDF documents');
      }
    });
  }

  sendMessage() {
    if (!this.messageText.trim()) {
      this._toastr.warning('Please enter a message');
      return;
    }

    if (!this.receiverId) {
      this._toastr.warning('No recipient selected');
      return;
    }

    // Create the appropriate payload object
    const payload: any = {
      content: this.messageText,
      receiver: this.getTargetUserId()
    };

    if (this.selectedPdfId !== null) {
      payload.attachment = Number(this.selectedPdfId);
    }


    console.log('Sending message with payload:', payload);

    this.messageService.sendMessage(payload).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        this.messageText = '';
        this.selectedPdfId = null;

        this._toastr.success('Message sent successfully');
        // this.loadMessages();
      },
      error: (err) => {
        console.error('Message send error:', err);
        this._toastr.error('Failed to send message');
      }
    });
  }

  deleteMessage(messageId: number) {
    this.messageService.deleteMessage(messageId).subscribe({
      next: () => {
        // this.loadMessages();
        this._toastr.info('Message deleted');
      },
      error: (err) => {
        console.error('Message delete error:', err);
        this._toastr.error('Failed to delete message');
      }
    });
  }
}
