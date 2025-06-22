export interface IMessage {
  id: number;
  sender: number;
  receiver: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  subject: string; // ✅ add this line
  sender_role?: string;
  attachment: number | null;
  attachment_details?: IAttachmentDetails;
  priority: 'high' | 'medium' | 'low';
  priority_display?: string;
  message_type: 'inquiry' | 'feedback' | 'report';
  type_display?: string;
  timestamp: string;
  is_read: boolean;
  is_today: boolean;
  is_forwarded: boolean;
  reply_to: number | null;
  reply_to_content?: string | null;
  forwarded_from: number | null;
  forwarded_from_details?: {
    id: number;
    content: string;
    original_sender: string;
    timestamp: string;
  } | null;
}



export interface IMessageSendResponse {
  success: string;
  message: IMessage;
}

export interface InboxResponse {
  inbox: IMessage[];
}



export interface IInbox {
  id: number;
  sender: number;
  receiver: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  attachment: number | null;
  attachment_details?: IAttachmentDetails;
  priority: 'high' | 'medium' | 'low';
  message_type: 'inquiry' | 'feedback' | 'report';
  timestamp: string;
  is_read: boolean;
  reply_to: number | null;
  reply_to_content?: string;
  is_forwarded: boolean;
  forwarded_from?: number | null;
}

export interface IAttachmentDetails {
  id: number
  file_name: string
  file: string
  signature_image: any
  signature_drawing: any
  is_signed: boolean
  signed_file: string
  uploaded_at: string
}


export interface IMessageStats {
  total_messages: number;
  unread_messages: number;
  today_messages: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  inquiry_count: number;
  feedback_count: number;
  report_count: number;
}


export interface IReplyPayload {
  content: string;
  priority: 'low' | 'medium' | 'high';
  attachment?: number | null; // optional attachment support
}

export interface IForwardPayload {
  recipient: number; // assuming user ID is used
  content: string;
  originalMessageId: number;
  attachment?: number | null;
}

export interface IAvailableRecipient {
  id: number;
  full_name: string;
  user_type: 'nss' | 'supervisor' | 'admin';
}
